import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from '@emotion/react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import {
  DiaryFiltersModal,
  resetDiaryFilters,
  toDiaryEntryFilterCriteria,
  useDiaryFilters,
} from '@features/filter-diary-entries';
import {
  DiarySearch,
  resetDiarySearch,
  useDiarySearch,
} from '@features/search-diary-entries';
import {
  buildDiaryListItems,
  createDefaultDiaryEntryQuery,
  type DiaryDayKey,
  type DiaryEntryQuery,
  DiaryLocalList,
  diaryLocalPageQueryOptions,
  useReadyDiaryDatabase,
} from '@entities/diary';
import * as ss from '@shared/styles';
import { Button, Checkbox } from '@shared/ui';

import * as s from '../styles/DiaryTransferModal';

type ExportSelectedEntriesScreenProps = {
  disabled: boolean;

  onExport: (entryIds: readonly string[]) => void | Promise<void>;
};

export const ExportSelectedEntriesScreen = ({
  disabled,
  onExport,
}: ExportSelectedEntriesScreenProps) => {
  const theme = useTheme();

  const { t } = useTranslation();

  const { userId, repository } = useReadyDiaryDatabase();

  const filters = useDiaryFilters();
  const search = useDiarySearch();

  const [currentPage, setCurrentPage] = useState(1);

  const [collapsedDayKeys, setCollapsedDayKeys] = useState<
    ReadonlySet<DiaryDayKey>
  >(() => new Set());

  const [selectedEntryIds, setSelectedEntryIds] = useState<ReadonlySet<string>>(
    () => new Set()
  );

  const diaryQuery = useMemo<DiaryEntryQuery>(
    () => ({
      ...createDefaultDiaryEntryQuery(),

      search: {
        ...search.search,
      },

      ...toDiaryEntryFilterCriteria(filters.appliedFilters),
    }),
    [filters.appliedFilters, search.search]
  );

  const pageQuery = useQuery(
    diaryLocalPageQueryOptions({
      userId,
      page: currentPage,
      query: diaryQuery,
      repository,
    })
  );

  const page = pageQuery.data;

  useEffect(() => {
    if (page === undefined) {
      return;
    }

    const lastPage = Math.max(page.pagination.totalPages, 1);

    if (currentPage > lastPage) {
      setCurrentPage(lastPage);
      setCollapsedDayKeys(new Set());
    }
  }, [currentPage, page?.pagination.totalPages]);

  useEffect(
    () => () => {
      resetDiaryFilters();
      resetDiarySearch();
    },
    []
  );

  const listItems = useMemo(
    () => buildDiaryListItems(page?.items ?? [], collapsedDayKeys),
    [collapsedDayKeys, page?.items]
  );

  const currentPageEntryIds = useMemo<readonly string[]>(
    () =>
      (page?.items ?? [])
        .filter((entry) => entry.syncStatus !== 'pendingDelete')
        .map((entry) => entry.id),
    [page?.items]
  );

  const allCurrentPageSelected =
    currentPageEntryIds.length > 0 &&
    currentPageEntryIds.every((entryId) => selectedEntryIds.has(entryId));

  const resetListPosition = useCallback(() => {
    setCurrentPage(1);
    setCollapsedDayKeys(new Set());
  }, []);

  const handleApplyFilters = useCallback(() => {
    if (filters.apply()) {
      resetListPosition();
    }
  }, [filters.apply, resetListPosition]);

  const handleApplySearch = useCallback(() => {
    const previousSearch = search.search;

    const nextSearch = search.applyText();

    if (nextSearch !== previousSearch) {
      resetListPosition();
    }
  }, [resetListPosition, search.applyText, search.search]);

  const handleSearchFieldChange = useCallback(
    (field: typeof search.search.field) => {
      if (field === search.search.field) {
        return;
      }

      search.setField(field);
      resetListPosition();
    },
    [resetListPosition, search.search.field, search.setField]
  );

  const handleClearSearch = useCallback(() => {
    const hadAppliedSearch = search.search.query !== null;

    search.clear();

    if (hadAppliedSearch) {
      resetListPosition();
    }
  }, [resetListPosition, search.clear, search.search.query]);

  const handleToggleDay = useCallback((dayKey: DiaryDayKey) => {
    setCollapsedDayKeys((currentKeys) => {
      const nextKeys = new Set(currentKeys);

      if (nextKeys.has(dayKey)) {
        nextKeys.delete(dayKey);
      } else {
        nextKeys.add(dayKey);
      }

      return nextKeys;
    });
  }, []);

  const handleToggleEntry = useCallback(
    (entryId: string) => {
      if (disabled) {
        return;
      }

      setSelectedEntryIds((currentIds) => {
        const nextIds = new Set(currentIds);

        if (nextIds.has(entryId)) {
          nextIds.delete(entryId);
        } else {
          nextIds.add(entryId);
        }

        return nextIds;
      });
    },
    [disabled]
  );

  const handleToggleCurrentPage = useCallback(() => {
    if (disabled || currentPageEntryIds.length === 0) {
      return;
    }

    setSelectedEntryIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (allCurrentPageSelected) {
        currentPageEntryIds.forEach((entryId) => {
          nextIds.delete(entryId);
        });
      } else {
        currentPageEntryIds.forEach((entryId) => {
          nextIds.add(entryId);
        });
      }

      return nextIds;
    });
  }, [allCurrentPageSelected, currentPageEntryIds, disabled]);

  const selectedEntryIdsArray = useMemo(
    () => Array.from(selectedEntryIds),
    [selectedEntryIds]
  );

  const canExport = !disabled && selectedEntryIdsArray.length > 0;

  return (
    <>
      <DiarySearch
        text={search.text}
        field={search.search.field}
        onTextChange={search.setText}
        onApplyText={handleApplySearch}
        onFieldChange={handleSearchFieldChange}
        onClear={handleClearSearch}
        filtersVisible={filters.visible}
        filtersApplied={filters.hasAppliedFilters}
        onOpenFilters={filters.open}
      />

      <s.Options>
        <Checkbox
          checked={allCurrentPageSelected}
          label={
            allCurrentPageSelected
              ? t('diary.selection.clearAll')
              : t('diary.selection.selectAll')
          }
          onPress={handleToggleCurrentPage}
        />

        <s.OptionDescription>
          {t('diary.selection.selected', {
            count: selectedEntryIds.size,
          })}
        </s.OptionDescription>
      </s.Options>

      <s.Root>
        <DiaryLocalList
          items={listItems}
          page={page}
          currentPage={currentPage}
          collapsedDayKeys={collapsedDayKeys}
          selectedEntryIds={selectedEntryIds}
          selectionActive
          dayToggleDisabled
          interactionDisabled={disabled}
          showPagination
          isInitialLoading={pageQuery.isLoading && page === undefined}
          hasInitialError={pageQuery.isError && page === undefined}
          isRefetching={pageQuery.isRefetching}
          isPaginationLoading={pageQuery.isFetching}
          onToggleDay={handleToggleDay}
          onToggleSelection={handleToggleEntry}
          onChangePage={(nextPage) => {
            if (disabled || pageQuery.isFetching || nextPage === currentPage) {
              return;
            }

            setCurrentPage(nextPage);
            setCollapsedDayKeys(new Set());
          }}
          onRetry={() => {
            void pageQuery.refetch();
          }}
        />
      </s.Root>

      <Button
        tone="input"
        disabled={!canExport}
        onPress={() => {
          if (!canExport) {
            return;
          }

          void onExport(selectedEntryIdsArray);
        }}
      >
        <s.OptionTitle style={ss.Text(theme)}>
          {t('transfer.actions.export')}
        </s.OptionTitle>
      </Button>

      <DiaryFiltersModal onApply={handleApplyFilters} />
    </>
  );
};
