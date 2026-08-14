import { useCallback } from 'react';
import { FlatList, type ListRenderItem, RefreshControl } from 'react-native';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import {
  DiaryDayHeader,
  type DiaryEntry,
  DiaryEntryCard,
} from '@entities/diary';
import { ErrorSection, LoadingView, Pagination } from '@shared/ui';

import type { OwnerDiaryListItem } from '../model/ownerDiaryList';
import type { useOwnerDiaryList } from '../model/useOwnerDiaryList';
import * as s from '../styles/OwnerDiaryList';

type OwnerDiaryListController = ReturnType<typeof useOwnerDiaryList>;

type OwnerDiaryListProps = {
  list: OwnerDiaryListController;

  selectionMode: boolean;

  selectedEntryIds: ReadonlySet<string>;

  isEntrySyncing: (entryId: string) => boolean;

  onToggleSelection: (entryId: string) => void;

  onOpenEntry: (entryId: string) => void;

  onOpenPhoto: (entry: DiaryEntry) => void;
};

export const OwnerDiaryList = ({
  list,

  selectionMode,

  selectedEntryIds,

  isEntrySyncing,

  onToggleSelection,

  onOpenEntry,
  onOpenPhoto,
}: OwnerDiaryListProps) => {
  const theme = useTheme();

  const { t } = useTranslation();

  const handleToggleSelection = useCallback(
    (entry: DiaryEntry) => {
      onToggleSelection(entry.id);
    },
    [onToggleSelection]
  );

  const renderEntry = useCallback(
    (entry: DiaryEntry) => {
      const selected = selectedEntryIds.has(entry.id);

      const synchronizing = isEntrySyncing(entry.id);

      if (selectionMode) {
        return (
          <DiaryEntryCard
            entry={entry}
            isVisible={list.visibleEntryIds.has(entry.id)}
            synchronizing={synchronizing}
            selectionActive
            selected={selected}
            onToggleSelection={handleToggleSelection}
          />
        );
      }

      return (
        <DiaryEntryCard
          entry={entry}
          isVisible={list.visibleEntryIds.has(entry.id)}
          synchronizing={synchronizing}
          onPress={() => {
            onOpenEntry(entry.id);
          }}
          onOpenPhoto={onOpenPhoto}
        />
      );
    },
    [
      handleToggleSelection,
      isEntrySyncing,
      list.visibleEntryIds,
      onOpenEntry,
      onOpenPhoto,
      selectedEntryIds,
      selectionMode,
    ]
  );

  const renderItem = useCallback<ListRenderItem<OwnerDiaryListItem>>(
    ({ item }) => {
      if (item.type === 'dayHeader') {
        return (
          <DiaryDayHeader
            dayKey={item.dayKey}
            title={item.title}
            entriesCount={item.entriesCount}
            collapsed={list.collapsedDayKeys.has(item.dayKey)}
            disabled={selectionMode}
            onToggle={list.toggleDay}
          />
        );
      }

      return renderEntry(item.entry);
    },
    [list.collapsedDayKeys, list.toggleDay, renderEntry, selectionMode]
  );

  if (list.isInitialLoading) {
    return <LoadingView />;
  }

  if (list.hasInitialError) {
    return (
      <ErrorSection
        message={t('diary.list.loadFailed')}
        onRetry={list.handleRetry}
      />
    );
  }

  return (
    <FlatList
      ref={list.listRef}
      data={list.listItems}
      keyExtractor={list.getListItemKey}
      renderItem={renderItem}
      ItemSeparatorComponent={s.ItemSeparator}
      refreshControl={
        <RefreshControl
          refreshing={list.isRefetching}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
          onRefresh={list.handleRetry}
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
        selectionMode || list.page === undefined ? null : (
          <s.Footer>
            <Pagination
              currentPage={list.currentPage}
              totalPages={list.page.pagination.totalPages}
              loading={list.isPaginationLoading}
              previousPageAccessibilityLabel={t(
                'diary.pagination.previousPage'
              )}
              nextPageAccessibilityLabel={t('diary.pagination.nextPage')}
              onChangePage={(page) => {
                void list.handleChangePage(page);
              }}
            />
          </s.Footer>
        )
      }
      viewabilityConfig={list.viewabilityConfig}
      onViewableItemsChanged={list.handleViewableItemsChanged}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    />
  );
};
