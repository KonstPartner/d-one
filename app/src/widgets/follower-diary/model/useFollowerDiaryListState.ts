import { useCallback, useEffect, useState } from 'react';

import type { DiaryDayKey } from '@entities/diary';

type FollowerDiaryListState = {
  ownerUid: string;

  collapsedDayKeys: ReadonlySet<DiaryDayKey>;
};

const createInitialState = (ownerUid: string): FollowerDiaryListState => ({
  ownerUid,
  collapsedDayKeys: new Set(),
});

export const useFollowerDiaryListState = (ownerUid: string) => {
  const [state, setState] = useState<FollowerDiaryListState>(() =>
    createInitialState(ownerUid)
  );

  useEffect(() => {
    setState((current) =>
      current.ownerUid === ownerUid ? current : createInitialState(ownerUid)
    );
  }, [ownerUid]);

  const collapsedDayKeys =
    state.ownerUid === ownerUid
      ? state.collapsedDayKeys
      : new Set<DiaryDayKey>();

  const toggleDay = useCallback(
    (dayKey: DiaryDayKey) => {
      setState((current) => {
        const currentKeys =
          current.ownerUid === ownerUid
            ? current.collapsedDayKeys
            : new Set<DiaryDayKey>();

        const nextKeys = new Set(currentKeys);

        if (nextKeys.has(dayKey)) {
          nextKeys.delete(dayKey);
        } else {
          nextKeys.add(dayKey);
        }

        return {
          ownerUid,
          collapsedDayKeys: nextKeys,
        };
      });
    },
    [ownerUid]
  );

  const expandAllDays = useCallback(() => {
    setState({
      ownerUid,
      collapsedDayKeys: new Set(),
    });
  }, [ownerUid]);

  return {
    collapsedDayKeys,

    toggleDay,
    expandAllDays,
  };
};
