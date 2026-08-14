import { useCallback, useEffect, useMemo, useState } from 'react';

export type SelectionId = string | number;

type UseSelectionParams<TId extends SelectionId> = {
  availableIds: ReadonlySet<TId>;

  disabled?: boolean;
};

export const useSelection = <TId extends SelectionId>({
  availableIds,

  disabled = false,
}: UseSelectionParams<TId>) => {
  const [selectionMode, setSelectionMode] = useState(false);

  const [selectedIds, setSelectedIds] = useState<ReadonlySet<TId>>(
    () => new Set()
  );

  useEffect(() => {
    setSelectedIds((currentIds) => {
      let changed = false;

      const nextIds = new Set<TId>();

      for (const id of currentIds) {
        if (availableIds.has(id)) {
          nextIds.add(id);
        } else {
          changed = true;
        }
      }

      return changed ? nextIds : currentIds;
    });
  }, [availableIds]);

  const selectedCount = selectedIds.size;

  const allSelected =
    availableIds.size > 0 && selectedCount === availableIds.size;

  const canEnter = !disabled && availableIds.size > 0;

  const enter = useCallback((): boolean => {
    if (!canEnter) {
      return false;
    }

    setSelectedIds(new Set());

    setSelectionMode(true);

    return true;
  }, [canEnter]);

  const exit = useCallback(() => {
    if (disabled) {
      return;
    }

    setSelectedIds(new Set());

    setSelectionMode(false);
  }, [disabled]);

  const forceExit = useCallback(() => {
    setSelectedIds(new Set());

    setSelectionMode(false);
  }, []);

  const clear = useCallback(() => {
    if (disabled) {
      return;
    }

    setSelectedIds(new Set());
  }, [disabled]);

  const toggle = useCallback(
    (id: TId) => {
      if (disabled || !selectionMode || !availableIds.has(id)) {
        return;
      }

      setSelectedIds((currentIds) => {
        const nextIds = new Set(currentIds);

        if (nextIds.has(id)) {
          nextIds.delete(id);
        } else {
          nextIds.add(id);
        }

        return nextIds;
      });
    },
    [availableIds, disabled, selectionMode]
  );

  const toggleAll = useCallback(() => {
    if (disabled || !selectionMode) {
      return;
    }

    setSelectedIds(allSelected ? new Set() : new Set(availableIds));
  }, [allSelected, availableIds, disabled, selectionMode]);

  const isSelected = useCallback(
    (id: TId): boolean => selectedIds.has(id),
    [selectedIds]
  );

  const selectedIdsArray = useMemo(
    () => Array.from(selectedIds),
    [selectedIds]
  );

  return {
    selectionMode,

    selectedIds,
    selectedIdsArray,

    selectedCount,

    allSelected,
    canEnter,

    enter,
    exit,
    forceExit,
    clear,

    toggle,
    toggleAll,

    isSelected,
  };
};
