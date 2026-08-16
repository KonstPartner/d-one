import { useCallback } from 'react';
import {
  FlatList,
  type FlatListProps,
  type ListRenderItem,
} from 'react-native';

import type { DiaryListItem } from '../lib/buildDiaryListItems';
import type { CloudDiaryEntry } from '../model/cloudDiaryEntry';
import type { useCloudDiaryList } from '../model/useCloudDiaryList';
import * as s from '../styles/CloudDiaryList';

import { CloudDiaryEntryCard } from './CloudDiaryEntryCard';
import { CloudDiaryPagination } from './CloudDiaryPagination';
import { DiaryDayHeader } from './DiaryDayHeader';

type CloudDiaryListItem = DiaryListItem<CloudDiaryEntry>;

type CloudDiaryListController = Pick<
  ReturnType<typeof useCloudDiaryList>,
  | 'listRef'
  | 'page'
  | 'listItems'
  | 'visibleEntryIds'
  | 'collapsedDayKeys'
  | 'toggleDay'
  | 'getListItemKey'
  | 'viewabilityConfig'
  | 'handleViewableItemsChanged'
  | 'hasPreviousPage'
  | 'hasNextPage'
  | 'isLoading'
>;

type CloudDiaryListSelection = {
  isEntrySelected: (entryId: string) => boolean;

  onToggleEntry: (entry: CloudDiaryEntry) => void;
};

type CloudDiaryListProps = {
  list: CloudDiaryListController;

  emptyTitle: string;
  emptyDescription: string;

  previousLabel: string;
  nextLabel: string;

  onPrevious: () => void;
  onNext: () => void;

  onOpenPhoto: (entry: CloudDiaryEntry) => void;

  selection?: CloudDiaryListSelection;

  contentContainerStyle?: FlatListProps<CloudDiaryListItem>['contentContainerStyle'];

  onScroll?: FlatListProps<CloudDiaryListItem>['onScroll'];

  onScrollBeginDrag?: FlatListProps<CloudDiaryListItem>['onScrollBeginDrag'];

  onScrollEndDrag?: FlatListProps<CloudDiaryListItem>['onScrollEndDrag'];
};

export const CloudDiaryList = ({
  list,

  emptyTitle,
  emptyDescription,

  previousLabel,
  nextLabel,

  onPrevious,
  onNext,

  onOpenPhoto,

  selection,

  contentContainerStyle,

  onScroll,
  onScrollBeginDrag,
  onScrollEndDrag,
}: CloudDiaryListProps) => {
  const selectionActive = selection !== undefined;

  const renderItem = useCallback<ListRenderItem<CloudDiaryListItem>>(
    ({ item }) => {
      if (item.type === 'dayHeader') {
        return (
          <DiaryDayHeader
            dayKey={item.dayKey}
            title={item.title}
            entriesCount={item.entriesCount}
            collapsed={list.collapsedDayKeys.has(item.dayKey)}
            disabled={selectionActive}
            onToggle={list.toggleDay}
          />
        );
      }

      return (
        <CloudDiaryEntryCard
          entry={item.entry}
          isVisible={list.visibleEntryIds.has(item.entry.id)}
          selectionActive={selectionActive}
          selected={selection?.isEntrySelected(item.entry.id) ?? false}
          onToggleSelection={selection?.onToggleEntry}
          onOpenPhoto={onOpenPhoto}
        />
      );
    },
    [
      list.collapsedDayKeys,
      list.toggleDay,
      list.visibleEntryIds,
      onOpenPhoto,
      selection,
      selectionActive,
    ]
  );

  return (
    <FlatList
      ref={list.listRef}
      data={list.listItems}
      keyExtractor={list.getListItemKey}
      renderItem={renderItem}
      ItemSeparatorComponent={s.ItemSeparator}
      contentContainerStyle={contentContainerStyle}
      onScroll={onScroll}
      onScrollBeginDrag={onScrollBeginDrag}
      onScrollEndDrag={onScrollEndDrag}
      scrollEventThrottle={16}
      ListEmptyComponent={
        <s.Empty>
          <s.EmptyTitle>{emptyTitle}</s.EmptyTitle>

          <s.EmptyDescription>{emptyDescription}</s.EmptyDescription>
        </s.Empty>
      }
      ListFooterComponent={
        selectionActive ||
        list.page === undefined ||
        list.listItems.length === 0 ? null : (
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
      initialNumToRender={5}
      maxToRenderPerBatch={5}
      updateCellsBatchingPeriod={50}
      windowSize={3}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    />
  );
};
