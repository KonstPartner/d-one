import { type DiaryEntry, DiaryLocalList } from '@entities/diary';

import type { useOwnerDiaryList } from '../model/useOwnerDiaryList';

type OwnerDiaryListController = ReturnType<typeof useOwnerDiaryList>;

type OwnerDiaryListProps = {
  list: OwnerDiaryListController;

  selectionMode: boolean;

  selectedEntryIds: ReadonlySet<string>;

  editDisabled: boolean;

  isEntrySyncing: (entryId: string) => boolean;

  onToggleSelection: (entryId: string) => void;

  onOpenEntry: (entryId: string) => void;

  onOpenPhoto: (entry: DiaryEntry) => void;
};

export const OwnerDiaryList = ({
  list,

  selectionMode,

  selectedEntryIds,

  editDisabled,

  isEntrySyncing,

  onToggleSelection,

  onOpenEntry,
  onOpenPhoto,
}: OwnerDiaryListProps) => (
  <DiaryLocalList
    items={list.listItems}
    page={list.page}
    currentPage={list.currentPage}
    collapsedDayKeys={list.collapsedDayKeys}
    visibleEntryIds={list.visibleEntryIds}
    selectedEntryIds={selectedEntryIds}
    selectionActive={selectionMode}
    dayToggleDisabled={selectionMode}
    interactionDisabled={editDisabled}
    showPagination={!selectionMode}
    isInitialLoading={list.isInitialLoading}
    hasInitialError={list.hasInitialError}
    isRefetching={list.isRefetching}
    isPaginationLoading={list.isPaginationLoading}
    isEntrySyncing={isEntrySyncing}
    listRef={list.listRef}
    viewabilityConfig={list.viewabilityConfig}
    onViewableItemsChanged={list.handleViewableItemsChanged}
    onToggleDay={list.toggleDay}
    onToggleSelection={onToggleSelection}
    onOpenEntry={onOpenEntry}
    onOpenPhoto={onOpenPhoto}
    onChangePage={list.handleChangePage}
    onRetry={list.handleRetry}
  />
);
