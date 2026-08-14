import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, type ViewToken } from 'react-native';

import type { CloudDiaryEntry, DiaryListItem } from '@entities/diary';

type FollowerDiaryListItem = DiaryListItem<CloudDiaryEntry>;

const VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 10,
};

const haveSameIds = (
  currentIds: ReadonlySet<string>,
  nextIds: ReadonlySet<string>
): boolean => {
  if (currentIds.size !== nextIds.size) {
    return false;
  }

  for (const id of currentIds) {
    if (!nextIds.has(id)) {
      return false;
    }
  }

  return true;
};

export const useFollowerDiaryViewability = (ownerUid: string) => {
  const listRef = useRef<FlatList<FollowerDiaryListItem>>(null);

  const [visibleEntryIds, setVisibleEntryIds] = useState<ReadonlySet<string>>(
    () => new Set()
  );

  const resetViewability = useCallback(() => {
    setVisibleEntryIds(new Set());

    listRef.current?.scrollToOffset({
      offset: 0,
      animated: false,
    });
  }, []);

  useEffect(() => {
    resetViewability();
  }, [ownerUid, resetViewability]);

  const handleViewableItemsChanged = useRef(
    ({
      viewableItems,
    }: {
      viewableItems: ViewToken<FollowerDiaryListItem>[];
    }) => {
      const nextVisibleEntryIds = new Set<string>();

      for (const token of viewableItems) {
        if (token.isViewable && token.item.type === 'entry') {
          nextVisibleEntryIds.add(token.item.entry.id);
        }
      }

      setVisibleEntryIds((currentVisibleEntryIds) =>
        haveSameIds(currentVisibleEntryIds, nextVisibleEntryIds)
          ? currentVisibleEntryIds
          : nextVisibleEntryIds
      );
    }
  ).current;

  return {
    listRef,

    visibleEntryIds,

    viewabilityConfig: VIEWABILITY_CONFIG,

    handleViewableItemsChanged,

    resetViewability,
  };
};
