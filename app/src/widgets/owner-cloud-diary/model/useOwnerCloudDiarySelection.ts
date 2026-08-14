import { useCallback, useMemo } from 'react';

import type { CloudDiaryEntry } from '@entities/diary';
import { useSelection } from '@shared/lib/selection';

type UseOwnerCloudDiarySelectionParams = {
  entries: readonly CloudDiaryEntry[];

  onEnter: () => void;
};

export const useOwnerCloudDiarySelection = ({
  entries,
  onEnter,
}: UseOwnerCloudDiarySelectionParams) => {
  const availableEntryIds = useMemo(
    () => new Set(entries.map((entry) => entry.id)),
    [entries]
  );

  const selection = useSelection({
    availableIds: availableEntryIds,
  });

  const enterSelection = useCallback(() => {
    const entered = selection.enter();

    if (!entered) {
      return;
    }

    onEnter();
  }, [onEnter, selection.enter]);

  const toggleEntry = useCallback(
    (entry: CloudDiaryEntry) => {
      selection.toggle(entry.id);
    },
    [selection.toggle]
  );

  const selectedEntries = useMemo(
    () => entries.filter((entry) => selection.selectedIds.has(entry.id)),
    [entries, selection.selectedIds]
  );

  return {
    selectionMode: selection.selectionMode,

    selectedEntryIds: selection.selectedIds,

    selectedEntries,

    selectedCount: selection.selectedCount,

    allSelected: selection.allSelected,

    canEnterSelection: selection.canEnter,

    enterSelection,

    exitSelection: selection.exit,

    toggleEntry,

    toggleAll: selection.toggleAll,

    isEntrySelected: selection.isSelected,
  };
};
