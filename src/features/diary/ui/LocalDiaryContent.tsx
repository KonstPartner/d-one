import { type ReactElement, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  type ListRenderItem,
  Text,
  View,
} from 'react-native';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import { ErrorSection, LoadingView } from '@entities/shared/ui';

import useLocalDiaryContent from '../model/hooks/useLocalDiaryContent';
import type { DiaryListItem } from '../model/list';
import type { DiaryEntry } from '../model/types';
import * as styles from '../styles/LocalDiaryContent';

import DiaryDayHeader from './DiaryDayHeader';
import DiaryPagination from './DiaryPagination';

type LocalDiaryContentProps = {
  renderEntry: (entry: DiaryEntry, isVisible: boolean) => ReactElement;
  selectionMode?: boolean;
};

const LocalDiaryContent = ({
  renderEntry,
  selectionMode = false,
}: LocalDiaryContentProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const {
    listRef,
    page,
    listItems,
    visibleEntryIds,
    collapsedDayKeys,
    toggleDay,
    getDiaryListItemKey,
    viewabilityConfig,
    handleViewableItemsChanged,
    handleChangePage,
    handleRetry,
    isInitialLoading,
    hasInitialError,
    isRefetching,
    isPaginationLoading,
  } = useLocalDiaryContent();

  const renderItem = useCallback<ListRenderItem<DiaryListItem>>(
    ({ item }) => {
      if (item.type === 'dayHeader') {
        return (
          <DiaryDayHeader
            dayKey={item.dayKey}
            title={item.title}
            entriesCount={item.entriesCount}
            collapsed={collapsedDayKeys.has(item.dayKey)}
            onToggle={selectionMode ? () => undefined : toggleDay}
          />
        );
      }

      return renderEntry(item.entry, visibleEntryIds.has(item.entry.id));
    },
    [collapsedDayKeys, renderEntry, selectionMode, toggleDay, visibleEntryIds]
  );

  if (isInitialLoading) {
    return <LoadingView loading />;
  }

  if (hasInitialError) {
    return (
      <View style={styles.ErrorContent}>
        <ErrorSection
          callback={handleRetry}
          error={t('diary.list.loadFailed')}
        />
      </View>
    );
  }

  if (page === undefined || page.items.length === 0) {
    return (
      <View style={styles.EmptyContent(theme)}>
        <Text style={styles.EmptyTitle(theme)}>
          {t('diary.list.empty.title')}
        </Text>

        <Text style={styles.EmptyDescription(theme)}>
          {t('diary.list.empty.description')}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      ref={listRef}
      data={listItems}
      extraData={{ selectionMode, visibleEntryIds }}
      renderItem={renderItem}
      keyExtractor={getDiaryListItemKey}
      style={styles.Fill}
      contentContainerStyle={styles.ListContent(theme)}
      ListHeaderComponent={
        isRefetching ? <ActivityIndicator color={theme.colors.primary} /> : null
      }
      ListFooterComponent={
        selectionMode ? null : (
          <DiaryPagination
            currentPage={page.pagination.page}
            totalPages={page.pagination.totalPages}
            loading={isPaginationLoading}
            previousPageAccessibilityLabel={t('diary.pagination.previousPage')}
            nextPageAccessibilityLabel={t('diary.pagination.nextPage')}
            onChangePage={handleChangePage}
          />
        )
      }
      ListFooterComponentStyle={
        selectionMode ? undefined : styles.ListFooter(theme)
      }
      onViewableItemsChanged={handleViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      initialNumToRender={12}
      maxToRenderPerBatch={12}
      windowSize={7}
      removeClippedSubviews
    />
  );
};

export default LocalDiaryContent;
