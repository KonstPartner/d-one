import { useCallback, useEffect, useState } from 'react';

import type { DiaryExportFormat } from '@features/export-diary';
import type { DiaryTransferState } from '@entities/diary';

export type DiaryTransferRoute =
  | {
      name: 'home';
    }
  | {
      name: 'export.format';
    }
  | {
      name: 'export.scope';
      format: DiaryExportFormat;
    }
  | {
      name: 'export.period';
      format: DiaryExportFormat;
    }
  | {
      name: 'export.selected';
      format: DiaryExportFormat;
    }
  | {
      name: 'export.progress';
      format: DiaryExportFormat;
    }
  | {
      name: 'saved-exports.manage';
    }
  | {
      name: 'import.choose-file';
    }
  | {
      name: 'saved-exports.import';
    };

type UseDiaryTransferNavigationParams = {
  visible: boolean;

  transferPhase: DiaryTransferState['phase'];

  operationPending: boolean;

  onClose: () => void;
};

const INITIAL_ROUTE: DiaryTransferRoute = {
  name: 'home',
};

const isTransferNavigationLocked = (
  phase: DiaryTransferState['phase']
): boolean => {
  switch (phase) {
    case 'waitingForSync':
    case 'validating':
    case 'resolvingConflicts':
    case 'processing':
      return true;

    case 'idle':
    case 'completed':
    case 'failed':
      return false;
  }
};

export const useDiaryTransferNavigation = ({
  visible,

  transferPhase,
  operationPending,

  onClose,
}: UseDiaryTransferNavigationParams) => {
  const [routeStack, setRouteStack] = useState<DiaryTransferRoute[]>([
    INITIAL_ROUTE,
  ]);

  const locked = isTransferNavigationLocked(transferPhase) || operationPending;

  useEffect(() => {
    if (!visible) {
      setRouteStack([INITIAL_ROUTE]);
    }
  }, [visible]);

  const currentRoute = routeStack[routeStack.length - 1] ?? INITIAL_ROUTE;

  const pushRoute = useCallback(
    (route: DiaryTransferRoute): void => {
      if (locked) {
        return;
      }

      setRouteStack((current) => [...current, route]);
    },
    [locked]
  );

  const popRoute = useCallback((): void => {
    if (locked) {
      return;
    }

    setRouteStack((current) =>
      current.length > 1 ? current.slice(0, -1) : current
    );
  }, [locked]);

  const handleRequestClose = useCallback((): void => {
    if (locked) {
      return;
    }

    if (routeStack.length > 1) {
      setRouteStack((current) => current.slice(0, -1));

      return;
    }

    onClose();
  }, [locked, onClose, routeStack.length]);

  return {
    currentRoute,
    locked,

    pushRoute,
    popRoute,

    handleRequestClose,
  };
};
