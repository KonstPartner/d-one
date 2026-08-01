import {
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  type ListRenderItem,
  Text,
  View,
} from 'react-native';
import { useTheme } from '@emotion/react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { ErrorSection, LoadingView } from '@entities/shared/ui';
import * as globalStyles from '@features/shared/styles/global';
import { showNotification } from '@features/shared/ui';

import { diaryApi, useDiaryPage, useReadyDiaryDatabase } from '../api';
import {
  buildDiaryListItems,
  type DiaryEntry,
  type DiaryListItem,
  useDiaryList,
} from '../model';

import DiaryDayHeader from './DiaryDayHeader';
import DiaryPagination from './DiaryPagination';

type LocalDiaryContentProps = {
  renderEntry: (entry: DiaryEntry) => ReactElement;
};

const getDiaryListItemKey = (item: DiaryListItem): string => {
  if (item.type === 'dayHeader') {
    return `day:${item.dayKey}`;
  }

  return `entry:${item.entry.id}`;
};

const LocalDiaryContent = ({ renderEntry }: LocalDiaryContentProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { userId, repository } = useReadyDiaryDatabase();

  const { currentPage, collapsedDayKeys, setCurrentPage, toggleDay } =
    useDiaryList();

  const listRef = useRef<FlatList<DiaryListItem>>(null);
  const navigationInProgressRef = useRef(false);

  const [isNavigating, setIsNavigating] = useState(false);

  const query = useDiaryPage(currentPage);
  const page = query.data;

  const listItems = useMemo(
    () =>
      buildDiaryListItems({
        entries: page?.items ?? [],
        collapsedDayKeys,
      }),
    [collapsedDayKeys, page?.items]
  );

  useEffect(() => {
    if (page?.pagination.page !== currentPage) {
      return;
    }

    listRef.current?.scrollToOffset({
      offset: 0,
      animated: false,
    });
  }, [currentPage, page?.pagination.page]);

  const handleChangePage = async (nextPage: number) => {
    if (
      query.isFetching ||
      navigationInProgressRef.current ||
      nextPage === currentPage
    ) {
      return;
    }

    navigationInProgressRef.current = true;
    setIsNavigating(true);

    try {
      await queryClient.fetchQuery(
        diaryApi.getLocalPageOptions({
          userId,
          page: nextPage,
          repository,
        })
      );

      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Failed to load diary page', error);
      showNotification('error', t('diary.list.loadFailed'));
    } finally {
      navigationInProgressRef.current = false;
      setIsNavigating(false);
    }
  };

  const renderItem = useCallback<ListRenderItem<DiaryListItem>>(
    ({ item }) => {
      if (item.type === 'dayHeader') {
        return (
          <DiaryDayHeader
            dayKey={item.dayKey}
            title={item.title}
            entriesCount={item.entriesCount}
            collapsed={collapsedDayKeys.has(item.dayKey)}
            onToggle={toggleDay}
          />
        );
      }

      return renderEntry(item.entry);
    },
    [collapsedDayKeys, renderEntry, toggleDay]
  );

  if (query.isLoading && page === undefined) {
    return <LoadingView loading />;
  }

  if (query.isError && page === undefined) {
    return (
      <View style={[globalStyles.CenterContent, { flex: 1 }]}>
        <ErrorSection
          callback={() => {
            void query.refetch();
          }}
          error={t('diary.list.loadFailed')}
        />
      </View>
    );
  }

  if (page === undefined || page.items.length === 0) {
    return (
      <View
        style={[
          globalStyles.CenterContent,
          globalStyles.Stack(theme, 'sm'),
          { flex: 1 },
        ]}
      >
        <Text style={globalStyles.Subheading(theme)}>
          {t('diary.list.empty.title')}
        </Text>

        <Text
          style={[
            globalStyles.Body(theme),
            {
              color: theme.colors.muted,
              textAlign: 'center',
            },
          ]}
        >
          {t('diary.list.empty.description')}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      ref={listRef}
      data={listItems}
      renderItem={renderItem}
      keyExtractor={getDiaryListItemKey}
      style={{ flex: 1 }}
      contentContainerStyle={[
        globalStyles.Stack(theme, 'md'),
        {
          paddingTop: theme.spacing.md,
          paddingBottom: theme.spacing.xl,
        },
      ]}
      ListHeaderComponent={
        query.isRefetching ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : null
      }
      ListFooterComponent={
        <DiaryPagination
          currentPage={page.pagination.page}
          totalPages={page.pagination.totalPages}
          loading={query.isFetching || isNavigating}
          previousPageAccessibilityLabel={t('diary.pagination.previousPage')}
          nextPageAccessibilityLabel={t('diary.pagination.nextPage')}
          onChangePage={handleChangePage}
        />
      }
      ListFooterComponentStyle={{
        paddingTop: theme.spacing.sm,
      }}
      initialNumToRender={12}
      maxToRenderPerBatch={12}
      windowSize={7}
      removeClippedSubviews
    />
  );
};

export default LocalDiaryContent;
