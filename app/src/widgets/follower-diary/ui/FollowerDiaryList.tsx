import { useCallback } from 'react';
import { FlatList, type ListRenderItem } from 'react-native';

import {
  type CloudDiaryEntry,
  CloudDiaryEntryCard,
  CloudDiaryPagination,
  DiaryDayHeader,
  type DiaryListItem,
} from '@entities/diary';

import type { useFollowerDiaryList } from '../model/useFollowerDiaryList';
import * as s from '../styles/FollowerDiaryList';

type FollowerDiaryListItem = DiaryListItem<CloudDiaryEntry>;

type FollowerDiaryListController = ReturnType<typeof useFollowerDiaryList>;

type FollowerDiaryListProps = {
  list: FollowerDiaryListController;

  emptyTitle: string;
  emptyDescription: string;

  previousLabel: string;
  nextLabel: string;

  onPrevious: () => void;
  onNext: () => void;

  onOpenPhoto: (entry: CloudDiaryEntry) => void;
};

export const FollowerDiaryList = ({
  list,

  emptyTitle,
  emptyDescription,

  previousLabel,
  nextLabel,

  onPrevious,
  onNext,

  onOpenPhoto,
}: FollowerDiaryListProps) => {
  const renderItem = useCallback<ListRenderItem<FollowerDiaryListItem>>(
    ({ item }) => {
      if (item.type === 'dayHeader') {
        return (
          <DiaryDayHeader
            dayKey={item.dayKey}
            title={item.title}
            entriesCount={item.entriesCount}
            collapsed={list.collapsedDayKeys.has(item.dayKey)}
            onToggle={list.toggleDay}
          />
        );
      }

      return (
        <CloudDiaryEntryCard
          entry={item.entry}
          isVisible={list.visibleEntryIds.has(item.entry.id)}
          onOpenPhoto={onOpenPhoto}
        />
      );
    },
    [list.collapsedDayKeys, list.toggleDay, list.visibleEntryIds, onOpenPhoto]
  );

  return (
    <FlatList
      ref={list.listRef}
      data={list.listItems}
      keyExtractor={list.getListItemKey}
      renderItem={renderItem}
      ItemSeparatorComponent={s.ItemSeparator}
      ListEmptyComponent={
        <s.Empty>
          <s.EmptyTitle>{emptyTitle}</s.EmptyTitle>

          <s.EmptyDescription>{emptyDescription}</s.EmptyDescription>
        </s.Empty>
      }
      ListFooterComponent={
        list.page === undefined || list.listItems.length === 0 ? null : (
          <s.Footer>
            <CloudDiaryPagination
              hasPreviousPage={list.hasPreviousPage}
              hasNextPage={list.hasNextPage}
              loading={list.isLoading}
              previousLabel={previousLabel}
              nextLabel={nextLabel}
              onPrevious={onPrevious}
              onNext={onNext}
            />
          </s.Footer>
        )
      }
      viewabilityConfig={list.viewabilityConfig}
      onViewableItemsChanged={list.handleViewableItemsChanged}
      initialNumToRender={6}
      maxToRenderPerBatch={6}
      windowSize={5}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    />
  );
};
