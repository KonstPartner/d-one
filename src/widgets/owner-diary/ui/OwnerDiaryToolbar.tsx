import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { DiarySearch } from '@features/search-diary-entries';
import { type DiaryEntrySearchField } from '@entities/diary';
import { Button } from '@shared/ui';

type OwnerDiaryToolbarProps = {
  searchText: string;
  searchField: DiaryEntrySearchField;

  filtersVisible: boolean;
  filtersApplied: boolean;

  onSearchTextChange: (text: string) => void;

  onApplySearchText: () => void;

  onSearchFieldChange: (field: DiaryEntrySearchField) => void;

  onClearSearch: () => void;

  onOpenFilters: () => void;
  onCreateEntry: () => void;
};

export const OwnerDiaryToolbar = ({
  searchText,
  searchField,
  filtersVisible,
  filtersApplied,
  onSearchTextChange,
  onApplySearchText,
  onSearchFieldChange,
  onClearSearch,
  onOpenFilters,
  onCreateEntry,
}: OwnerDiaryToolbarProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const iconButtonStyle = {
    width: theme.control.height.lg,

    paddingHorizontal: 0,
    paddingVertical: 0,

    borderRadius: theme.radius.lg,
  };

  return (
    <DiarySearch
      text={searchText}
      field={searchField}
      onTextChange={onSearchTextChange}
      onApplyText={onApplySearchText}
      onFieldChange={onSearchFieldChange}
      onClear={onClearSearch}
      endActions={
        <>
          <Button
            accessibilityLabel={t('diary.filters.openAccessibilityLabel')}
            accessibilityState={{
              expanded: filtersVisible,
              selected: filtersApplied,
            }}
            tone="primary"
            variant={filtersApplied ? 'solid' : 'outline'}
            size="lg"
            style={iconButtonStyle}
            onPress={onOpenFilters}
          >
            <Ionicons
              name="filter-outline"
              size={theme.size.md}
              color={filtersApplied ? theme.colors.white : theme.colors.primary}
            />
          </Button>

          <Button
            accessibilityLabel={t('diary.form.openCreateAccessibilityLabel')}
            tone="primary"
            variant="solid"
            size="lg"
            style={iconButtonStyle}
            onPress={onCreateEntry}
          >
            <Ionicons
              name="add"
              size={theme.size.lg}
              color={theme.colors.white}
            />
          </Button>
        </>
      }
    />
  );
};
