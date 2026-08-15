import { useCallback } from 'react';
import {
  FlatList,
  type FlatListProps,
  type ListRenderItem,
  RefreshControl,
  type ViewabilityConfig,
} from 'react-native';
import { useTheme } from '@emotion/react';
import type { Ref } from 'react';
import { useTranslation } from 'react-i18next';

import { ErrorSection, LoadingView, Pagination } from '@shared/ui';

import {
  type DiaryListItem,
  getDiaryListItemKey,
} from '../lib/buildDiaryListItems';
import type { DiaryDayKey } from '../model/diaryDay';
import type { DiaryEntry } from '../model/diaryEntry';
import type { DiaryPageResult } from '../model/diaryPage';
import * as s from '../styles/DiaryLocalList';

import { DiaryDayHeader } from './DiaryDayHeader';
import { DiaryEntryCard } from './DiaryEntryCard';

type DiaryLocalListData = DiaryListItem<DiaryEntry>;

export type DiaryLocalListProps = {
  items: readonly DiaryLocalListData[];

  page: DiaryPageResult | undefined;
  currentPage: number;

  collapsedDayKeys: ReadonlySet<DiaryDayKey>;
  visibleEntryIds?: ReadonlySet<string>;

  selectedEntryIds?: ReadonlySet<string>;
  selectionActive?: boolean;

  dayToggleDisabled?: boolean;
  interactionDisabled?: boolean;

  showPagination?: boolean;

  isInitialLoading: boolean;
  hasInitialError: boolean;
  isRefetching: boolean;
  isPaginationLoading: boolean;

  isEntrySyncing?: (entryId: string) => boolean;

  listRef?: Ref<FlatList<DiaryLocalListData>>;
  viewabilityConfig?: ViewabilityConfig;

  onViewableItemsChanged?: FlatListProps<DiaryLocalListData>['onViewableItemsChanged'];

  contentContainerStyle?: FlatListProps<DiaryLocalListData>['contentContainerStyle'];

  onScroll?: FlatListProps<DiaryLocalListData>['onScroll'];

  onScrollBeginDrag?: FlatListProps<DiaryLocalListData>['onScrollBeginDrag'];

  onScrollEndDrag?: FlatListProps<DiaryLocalListData>['onScrollEndDrag'];

  onToggleDay: (dayKey: DiaryDayKey) => void;
  onToggleSelection?: (entryId: string) => void;

  onOpenEntry?: (entryId: string) => void;
  onOpenPhoto?: (entry: DiaryEntry) => void;

  onChangePage: (page: number) => void | Promise<void>;
  onRetry: () => void;
};

const EMPTY_SELECTED_ENTRY_IDS: ReadonlySet<string> = new Set();

export const DiaryLocalList = ({
  items,

  page,
  currentPage,

  collapsedDayKeys,
  visibleEntryIds,

  selectedEntryIds = EMPTY_SELECTED_ENTRY_IDS,
  selectionActive = false,

  dayToggleDisabled = false,
  interactionDisabled = false,

  showPagination = true,

  isInitialLoading,
  hasInitialError,
  isRefetching,
  isPaginationLoading,

  isEntrySyncing = () => false,

  listRef,
  viewabilityConfig,
  onViewableItemsChanged,

  contentContainerStyle,

  onScroll,
  onScrollBeginDrag,
  onScrollEndDrag,

  onToggleDay,
  onToggleSelection,

  onOpenEntry,
  onOpenPhoto,

  onChangePage,
  onRetry,
}: DiaryLocalListProps) => {
  const theme = useTheme();

  const { t } = useTranslation();

  const renderEntry = useCallback(
    (entry: DiaryEntry) => {
      const selected = selectedEntryIds.has(entry.id);

      const synchronizing = isEntrySyncing(entry.id);

      if (selectionActive) {
        return (
          <DiaryEntryCard
            entry={entry}
            isVisible={visibleEntryIds?.has(entry.id) ?? true}
            synchronizing={synchronizing}
            selectionActive
            selected={selected}
            onToggleSelection={
              onToggleSelection === undefined
                ? undefined
                : () => {
                    onToggleSelection(entry.id);
                  }
            }
          />
        );
      }

      return (
        <DiaryEntryCard
          entry={entry}
          isVisible={visibleEntryIds?.has(entry.id) ?? true}
          synchronizing={synchronizing}
          onPress={
            interactionDisabled || onOpenEntry === undefined
              ? undefined
              : () => {
                  onOpenEntry(entry.id);
                }
          }
          onOpenPhoto={interactionDisabled ? undefined : onOpenPhoto}
        />
      );
    },
    [
      interactionDisabled,
      isEntrySyncing,
      onOpenEntry,
      onOpenPhoto,
      onToggleSelection,
      selectedEntryIds,
      selectionActive,
      visibleEntryIds,
    ]
  );

  const renderItem = useCallback<ListRenderItem<DiaryLocalListData>>(
    ({ item }) => {
      if (item.type === 'dayHeader') {
        return (
          <DiaryDayHeader
            dayKey={item.dayKey}
            title={item.title}
            entriesCount={item.entriesCount}
            collapsed={collapsedDayKeys.has(item.dayKey)}
            disabled={dayToggleDisabled}
            onToggle={onToggleDay}
          />
        );
      }

      return renderEntry(item.entry);
    },
    [collapsedDayKeys, dayToggleDisabled, onToggleDay, renderEntry]
  );

  if (isInitialLoading) {
    return <LoadingView />;
  }

  if (hasInitialError) {
    return (
      <ErrorSection message={t('diary.list.loadFailed')} onRetry={onRetry} />
    );
  }

  return (
    <FlatList
      ref={listRef}
      data={items}
      keyExtractor={getDiaryListItemKey}
      renderItem={renderItem}
      ItemSeparatorComponent={s.ItemSeparator}
      contentContainerStyle={contentContainerStyle}
      onScroll={onScroll}
      onScrollBeginDrag={onScrollBeginDrag}
      onScrollEndDrag={onScrollEndDrag}
      scrollEventThrottle={16}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
          onRefresh={onRetry}
        />
      }
      ListEmptyComponent={
        <s.Empty>
          <s.EmptyTitle>{t('diary.list.empty.title')}</s.EmptyTitle>

          <s.EmptyDescription>
            {t('diary.list.empty.description')}
          </s.EmptyDescription>
        </s.Empty>
      }
      ListFooterComponent={
        !showPagination || page === undefined ? null : (
          <s.Footer>
            <Pagination
              currentPage={currentPage}
              totalPages={page.pagination.totalPages}
              loading={isPaginationLoading}
              previousPageAccessibilityLabel={t(
                'diary.pagination.previousPage'
              )}
              nextPageAccessibilityLabel={t('diary.pagination.nextPage')}
              onChangePage={(nextPage) => {
                void onChangePage(nextPage);
              }}
            />
          </s.Footer>
        )
      }
      viewabilityConfig={viewabilityConfig}
      onViewableItemsChanged={onViewableItemsChanged}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    />
  );
};
