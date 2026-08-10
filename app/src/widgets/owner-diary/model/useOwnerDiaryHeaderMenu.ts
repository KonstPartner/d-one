import { useMemo } from 'react';

import { type HeaderMenuItem, useHeaderMenu } from '@widgets/header-menu';
import type { DiaryDayKey } from '@entities/diary';

type UseOwnerDiaryHeaderMenuParams = {
  selectionMode: boolean;

  connectionState: 'unknown' | 'offline' | 'online';

  batchActive: boolean;
  manualSyncPending: boolean;

  canEnterSelection: boolean;

  currentPageDayKeys: ReadonlyArray<DiaryDayKey>;

  collapsedDayKeys: ReadonlySet<DiaryDayKey>;

  onManualSync: () => void | Promise<void>;

  onEnterSelection: () => void;

  onCollapseAllDays: (dayKeys: ReadonlyArray<DiaryDayKey>) => void;
  onExpandAllDays: () => void;
};

export const useOwnerDiaryHeaderMenu = ({
  selectionMode,

  connectionState,

  batchActive,
  manualSyncPending,

  canEnterSelection,

  currentPageDayKeys,
  collapsedDayKeys,

  onManualSync,

  onEnterSelection,

  onCollapseAllDays,
  onExpandAllDays,
}: UseOwnerDiaryHeaderMenuParams): void => {
  const items = useMemo<HeaderMenuItem[]>(() => {
    if (selectionMode) {
      return [];
    }

    const allDaysCollapsed =
      currentPageDayKeys.length > 0 &&
      currentPageDayKeys.every((dayKey) => collapsedDayKeys.has(dayKey));

    const menuItems: HeaderMenuItem[] = [
      {
        key: 'diary-synchronize',

        labelKey: 'diary.menu.synchronize',

        icon: 'sync-outline',

        disabled:
          connectionState !== 'online' || batchActive || manualSyncPending,

        onPress: () => {
          void onManualSync();
        },
      },

      {
        key: 'diary-select-entries',

        labelKey: 'diary.menu.selectEntries',

        icon: 'checkbox-outline',

        disabled: !canEnterSelection,

        onPress: onEnterSelection,
      },
    ];

    if (currentPageDayKeys.length === 0) {
      return menuItems;
    }

    if (allDaysCollapsed) {
      menuItems.push({
        key: 'diary-expand-all-days',

        labelKey: 'diary.menu.expandAllDays',

        icon: 'expand-outline',

        onPress: onExpandAllDays,
      });

      return menuItems;
    }

    menuItems.push({
      key: 'diary-collapse-all-days',

      labelKey: 'diary.menu.collapseAllDays',

      icon: 'contract-outline',

      onPress: () => {
        onCollapseAllDays(currentPageDayKeys);
      },
    });

    return menuItems;
  }, [
    batchActive,
    canEnterSelection,
    collapsedDayKeys,
    connectionState,
    currentPageDayKeys,
    manualSyncPending,
    onCollapseAllDays,
    onEnterSelection,
    onExpandAllDays,
    onManualSync,
    selectionMode,
  ]);

  useHeaderMenu(items);
};
