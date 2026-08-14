import { useCallback, useEffect, useMemo, useState } from 'react';

import type { CloudDiaryEntry } from '@entities/diary';

type UseOwnerCloudDiarySelectionParams = {
  entries: readonly CloudDiaryEntry[];

  onEnter: () => void;
};

export const useOwnerCloudDiarySelection = ({
  entries,
  onEnter,
}: UseOwnerCloudDiarySelectionParams) => {
  const [selectionMode, setSelectionMode] = useState(false);

  const [selectedEntryIds, setSelectedEntryIds] = useState<ReadonlySet<string>>(
    () => new Set()
  );

  const availableEntryIds = useMemo(
    () => new Set(entries.map((entry) => entry.id)),
    [entries]
  );

  useEffect(() => {
    setSelectedEntryIds((currentIds) => {
      const nextIds = new Set(
        Array.from(currentIds).filter((entryId) =>
          availableEntryIds.has(entryId)
        )
      );

      if (nextIds.size === currentIds.size) {
        return currentIds;
      }

      return nextIds;
    });
  }, [availableEntryIds]);

  const selectedCount = selectedEntryIds.size;

  const allSelected =
    availableEntryIds.size > 0 && selectedCount === availableEntryIds.size;

  const canEnterSelection = availableEntryIds.size > 0;

  const enterSelection = useCallback(() => {
    if (!canEnterSelection) {
      return;
    }

    setSelectedEntryIds(new Set());

    setSelectionMode(true);

    onEnter();
  }, [canEnterSelection, onEnter]);

  const exitSelection = useCallback(() => {
    setSelectedEntryIds(new Set());

    setSelectionMode(false);
  }, []);

  const toggleEntry = useCallback(
    (entry: CloudDiaryEntry) => {
      if (!selectionMode || !availableEntryIds.has(entry.id)) {
        return;
      }

      setSelectedEntryIds((currentIds) => {
        const nextIds = new Set(currentIds);

        if (nextIds.has(entry.id)) {
          nextIds.delete(entry.id);
        } else {
          nextIds.add(entry.id);
        }

        return nextIds;
      });
    },
    [availableEntryIds, selectionMode]
  );

  const toggleAll = useCallback(() => {
    if (!selectionMode) {
      return;
    }

    setSelectedEntryIds(allSelected ? new Set() : new Set(availableEntryIds));
  }, [allSelected, availableEntryIds, selectionMode]);

  const isEntrySelected = useCallback(
    (entryId: string): boolean => selectedEntryIds.has(entryId),
    [selectedEntryIds]
  );

  const selectedEntries = useMemo(
    () => entries.filter((entry) => selectedEntryIds.has(entry.id)),
    [entries, selectedEntryIds]
  );

  return {
    selectionMode,

    selectedEntryIds,
    selectedEntries,

    selectedCount,

    allSelected,

    canEnterSelection,

    enterSelection,
    exitSelection,

    toggleEntry,
    toggleAll,

    isEntrySelected,
  };
};
