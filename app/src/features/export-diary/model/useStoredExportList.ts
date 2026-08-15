import { useEffect, useMemo, useState } from 'react';

import type { DiaryStoredExportFile } from '@entities/diary';

import { useDiaryExportFiles } from '../api/useDiaryExportFiles';
import { useDiaryExportMutation } from '../api/useDiaryExportMutation';

import type { DiaryUnfinishedExport } from './diaryUnfinishedExport';

export type StoredExportListMode = 'manage' | 'import';

export type StoredExportDeleteTarget =
  | { type: 'unfinished'; exportId: string }
  | { type: 'finished'; fileNames: readonly string[] };

type UseStoredExportListParams = {
  mode: StoredExportListMode;
};

export const useStoredExportList = ({ mode }: UseStoredExportListParams) => {
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] =
    useState<StoredExportDeleteTarget | null>(null);
  const [selectedFinishedFileNames, setSelectedFinishedFileNames] = useState<
    ReadonlySet<string>
  >(() => new Set());
  const [openedFinishedExport, setOpenedFinishedExport] =
    useState<DiaryStoredExportFile | null>(null);
  const [resumingExportId, setResumingExportId] = useState<string | null>(null);

  const files = useDiaryExportFiles();
  const exportMutation = useDiaryExportMutation();

  const normalizedSearch = search.trim().toLocaleLowerCase();

  const filteredFinishedExports = useMemo(
    () =>
      files.finishedExports.filter((file) => {
        if (mode === 'import' && file.kind !== 'backup') {
          return false;
        }

        return (
          normalizedSearch.length === 0 ||
          file.fileName.toLocaleLowerCase().includes(normalizedSearch)
        );
      }),
    [files.finishedExports, mode, normalizedSearch]
  );

  const filteredUnfinishedExports = useMemo(
    () =>
      mode === 'manage'
        ? files.unfinishedExports.filter(
            (item) =>
              normalizedSearch.length === 0 ||
              item.fileName.toLocaleLowerCase().includes(normalizedSearch)
          )
        : [],
    [files.unfinishedExports, mode, normalizedSearch]
  );

  useEffect(() => {
    const availableFileNames = new Set(
      files.finishedExports.map((file) => file.fileName)
    );

    setSelectedFinishedFileNames((current) => {
      const next = new Set(
        Array.from(current).filter((fileName) =>
          availableFileNames.has(fileName)
        )
      );

      return next.size === current.size ? current : next;
    });
  }, [files.finishedExports]);

  const operationsDisabled =
    exportMutation.isExporting || files.isDeleting || files.isRefreshing;

  const hasAnyExports =
    mode === 'manage'
      ? files.finishedExports.length > 0 || files.unfinishedExports.length > 0
      : files.finishedExports.some((file) => file.kind === 'backup');

  const filteredFinishedFileNames = useMemo(
    () => filteredFinishedExports.map((file) => file.fileName),
    [filteredFinishedExports]
  );

  const allFilteredFinishedSelected =
    filteredFinishedFileNames.length > 0 &&
    filteredFinishedFileNames.every((fileName) =>
      selectedFinishedFileNames.has(fileName)
    );

  const toggleFinished = (fileName: string): void => {
    if (mode !== 'manage' || operationsDisabled) {
      return;
    }

    setSelectedFinishedFileNames((current) => {
      const next = new Set(current);

      if (next.has(fileName)) {
        next.delete(fileName);
      } else {
        next.add(fileName);
      }

      return next;
    });
  };

  const toggleAllFiltered = (): void => {
    if (operationsDisabled || filteredFinishedFileNames.length === 0) {
      return;
    }

    setSelectedFinishedFileNames((current) => {
      const next = new Set(current);

      filteredFinishedFileNames.forEach((fileName) => {
        if (allFilteredFinishedSelected) {
          next.delete(fileName);
        } else {
          next.add(fileName);
        }
      });

      return next;
    });
  };

  const resumeExport = async (item: DiaryUnfinishedExport): Promise<void> => {
    exportMutation.reset();
    setResumingExportId(item.exportId);

    try {
      await exportMutation.resumeDiaryExport(item.exportId);
    } catch {
      return;
    } finally {
      setResumingExportId(null);
    }
  };

  const requestDeleteUnfinished = (exportId: string): void => {
    files.resetDelete();
    setDeleteTarget({ type: 'unfinished', exportId });
  };

  const requestDeleteSelected = (): void => {
    if (selectedFinishedFileNames.size === 0) {
      return;
    }

    files.resetDelete();
    setDeleteTarget({
      type: 'finished',
      fileNames: Array.from(selectedFinishedFileNames),
    });
  };

  const confirmDelete = async (): Promise<void> => {
    if (deleteTarget === null) {
      return;
    }

    files.resetDelete();

    try {
      if (deleteTarget.type === 'unfinished') {
        await files.deleteUnfinishedExport(deleteTarget.exportId);
      } else {
        await files.deleteFinishedExports(deleteTarget.fileNames);

        setSelectedFinishedFileNames((current) => {
          const next = new Set(current);
          deleteTarget.fileNames.forEach((fileName) => next.delete(fileName));

          return next;
        });
      }

      setDeleteTarget(null);
    } catch {
      return;
    }
  };

  const closeDeleteDialog = (): void => {
    if (!files.isDeleting) {
      setDeleteTarget(null);
    }
  };

  return {
    search,
    setSearch,
    filteredFinishedExports,
    filteredUnfinishedExports,
    hasAnyExports,

    selectedFinishedFileNames,
    selectedCount: selectedFinishedFileNames.size,
    allFilteredFinishedSelected,
    toggleFinished,
    toggleAllFiltered,

    openedFinishedExport,
    openFinishedExport: setOpenedFinishedExport,
    closeFinishedExport: () => setOpenedFinishedExport(null),

    deleteTarget,
    requestDeleteUnfinished,
    requestDeleteSelected,
    confirmDelete,
    closeDeleteDialog,

    resumingExportId,
    resumeExport,

    operationsDisabled,
    isLoading: files.isLoading,
    isRefreshing: files.isRefreshing,
    isDeleting: files.isDeleting,
    loadError: files.loadError,
    deleteError: files.deleteError,
    resumeError: exportMutation.error,
    isExporting: exportMutation.isExporting,
    refresh: files.refresh,
  };
};
