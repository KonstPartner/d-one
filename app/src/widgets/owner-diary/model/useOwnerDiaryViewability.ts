import { useEffect, useRef, useState } from 'react';
import { FlatList, type ViewToken } from 'react-native';

import type { DiaryEntryQuery } from '@entities/diary';

import type { OwnerDiaryListItem } from './ownerDiaryList';

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

type UseOwnerDiaryViewabilityParams = {
  currentPage: number;

  diaryQuery: DiaryEntryQuery;

  loadedPage: number | undefined;
};

export const useOwnerDiaryViewability = ({
  currentPage,

  diaryQuery,

  loadedPage,
}: UseOwnerDiaryViewabilityParams) => {
  const listRef = useRef<FlatList<OwnerDiaryListItem>>(null);

  const [visibleEntryIds, setVisibleEntryIds] = useState<ReadonlySet<string>>(
    () => new Set()
  );

  useEffect(() => {
    if (loadedPage !== currentPage) {
      return;
    }

    setVisibleEntryIds(new Set());

    listRef.current?.scrollToOffset({
      offset: 0,
      animated: false,
    });
  }, [currentPage, diaryQuery, loadedPage]);

  const handleViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<OwnerDiaryListItem>[] }) => {
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
  };
};
