import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import {
  DIARY_ENTRY_SEARCH_FIELDS,
  type DiaryEntrySearchField,
  DiaryMetricIcon,
  isDiaryEntryTextSearchField,
} from '@entities/diary';
import {
  IconButton,
  SearchInput,
  SelectDropdown,
  type SelectDropdownOption,
} from '@shared/ui';

import { isDiarySearchInputAllowed } from '../model/search';
import * as s from '../styles/DiarySearch';

const SEARCH_DEBOUNCE_MS = 400;

const SEARCH_FIELD_PRESENTATION: Record<
  DiaryEntrySearchField,
  Pick<SelectDropdownOption<DiaryEntrySearchField>, 'tone'>
> = {
  comment: {
    tone: 'primary',
  },

  aiAnalysis: {
    tone: 'primary',
  },

  glucose: {
    tone: 'primary',
  },

  shortInsulin: {
    tone: 'warning',
  },

  ultraShortInsulin: {
    tone: 'warning',
  },

  longInsulin: {
    tone: 'success',
  },

  carbsGram: {
    tone: 'success',
  },
};

const TEXT_SEARCH_FIELD_ICONS: Record<
  Extract<DiaryEntrySearchField, 'comment' | 'aiAnalysis'>,
  ComponentProps<typeof Ionicons>['name']
> = {
  comment: 'chatbubble-outline',
  aiAnalysis: 'sparkles-outline',
};

const renderSearchFieldIcon = (
  field: DiaryEntrySearchField,
  size: number,
  color: string
): ReactNode => {
  if (isDiaryEntryTextSearchField(field)) {
    return (
      <Ionicons
        name={TEXT_SEARCH_FIELD_ICONS[field]}
        size={size}
        color={color}
      />
    );
  }

  return <DiaryMetricIcon metric={field} size={size} color={color} />;
};

type DiarySearchProps = {
  text: string;

  field: DiaryEntrySearchField;

  onTextChange: (text: string) => void;

  onApplyText: () => void;

  onFieldChange: (field: DiaryEntrySearchField) => void;

  onClear: () => void;

  filtersVisible: boolean;
  filtersApplied: boolean;

  onOpenFilters: () => void;

  onCreateEntry?: () => void;
  createDisabled?: boolean;
};

export const DiarySearch = ({
  text,
  field,

  createDisabled = false,

  onTextChange,
  onApplyText,
  onFieldChange,
  onClear,

  filtersVisible,
  filtersApplied,

  onOpenFilters,
  onCreateEntry,
}: DiarySearchProps) => {
  const theme = useTheme();

  const { t } = useTranslation();

  const applyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedFieldLabel = t(`diary.search.fields.${field}`);

  const clearApplyTimer = useCallback(() => {
    if (applyTimerRef.current === null) {
      return;
    }

    clearTimeout(applyTimerRef.current);

    applyTimerRef.current = null;
  }, []);

  useEffect(
    () => () => {
      clearApplyTimer();
    },
    [clearApplyTimer]
  );

  const handleTextChange = useCallback(
    (nextText: string) => {
      if (!isDiarySearchInputAllowed(field, nextText)) {
        return;
      }

      onTextChange(nextText);

      clearApplyTimer();

      if (nextText.length === 0) {
        onApplyText();

        return;
      }

      applyTimerRef.current = setTimeout(() => {
        applyTimerRef.current = null;

        onApplyText();
      }, SEARCH_DEBOUNCE_MS);
    },
    [clearApplyTimer, field, onApplyText, onTextChange]
  );

  const handleFieldChange = useCallback(
    (nextField: DiaryEntrySearchField) => {
      clearApplyTimer();

      onFieldChange(nextField);
    },
    [clearApplyTimer, onFieldChange]
  );

  const handleSearchClick = useCallback(
    (value: string) => {
      clearApplyTimer();

      if (value.length === 0) {
        onClear();

        return;
      }

      onApplyText();
    },
    [clearApplyTimer, onApplyText, onClear]
  );

  const getFieldColors = useCallback(
    (searchField: DiaryEntrySearchField) => {
      if (searchField === 'comment') {
        return {
          background: theme.colors.shades.primary.sm,

          border: theme.colors.shades.primary.lg,

          text: theme.colors.primary,
        };
      } else if (searchField === 'aiAnalysis') {
        return theme.colors.metrics.longInsulin;
      }

      return theme.colors.metrics[searchField];
    },
    [theme]
  );

  const fieldOptions = useMemo<SelectDropdownOption<DiaryEntrySearchField>[]>(
    () =>
      DIARY_ENTRY_SEARCH_FIELDS.map((option) => ({
        key: option,

        value: option,

        label: t(`diary.search.fields.${option}`),

        ...SEARCH_FIELD_PRESENTATION[option],

        colors: getFieldColors(option),
      })),
    [getFieldColors, t]
  );

  return (
    <s.Root>
      <s.Row>
        <s.SelectView>
          <SelectDropdown
            placeholder={selectedFieldLabel}
            selectedLabel={selectedFieldLabel}
            options={fieldOptions}
            inlineOptions
            isSelected={(option) => option.value === field}
            onSelect={handleFieldChange}
            renderSelectedIcon={(option) => {
              const colors = getFieldColors(option.value);

              return renderSearchFieldIcon(option.value, 18, colors.text);
            }}
            renderOption={({ option, selected, onPress }) => {
              const colors = getFieldColors(option.value);

              return (
                <s.SearchOption
                  $selected={selected}
                  $backgroundColor={colors.background}
                  $borderColor={colors.border}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected,
                  }}
                  onPress={onPress}
                >
                  <s.SearchOptionContent>
                    <s.SearchOptionIcon
                      $backgroundColor={colors.background}
                      $borderColor={colors.border}
                    >
                      {renderSearchFieldIcon(option.value, 20, colors.text)}
                    </s.SearchOptionIcon>

                    <s.SearchOptionText
                      $selected={selected}
                      $color={colors.text}
                    >
                      {option.label}
                    </s.SearchOptionText>
                  </s.SearchOptionContent>

                  <s.SearchOptionCheck>
                    {selected && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={colors.text}
                      />
                    )}
                  </s.SearchOptionCheck>
                </s.SearchOption>
              );
            }}
          />
        </s.SelectView>

        <s.Row>
          <IconButton
            icon="filter-outline"
            accessibilityLabel={t('diary.filters.openAccessibilityLabel')}
            accessibilityState={{
              expanded: filtersVisible,

              selected: filtersApplied,
            }}
            tone="primary"
            variant={filtersApplied ? 'solid' : 'outline'}
            size="lg"
            onPress={onOpenFilters}
          />

          {onCreateEntry !== undefined && (
            <s.Add>
              <IconButton
                icon="add"
                style={{}}
                accessibilityLabel={t(
                  'diary.form.openCreateAccessibilityLabel'
                )}
                disabled={createDisabled}
                tone="primary"
                variant="solid"
                size="lg"
                iconSize={24}
                onPress={onCreateEntry}
              />
            </s.Add>
          )}
        </s.Row>
      </s.Row>

      <SearchInput
        value={text}
        placeholder={t('diary.search.placeholder')}
        accessibilityLabel={t('diary.search.inputAccessibilityLabel')}
        keyboardType={
          isDiaryEntryTextSearchField(field) ? 'default' : 'decimal-pad'
        }
        inputMode={isDiaryEntryTextSearchField(field) ? 'search' : 'decimal'}
        returnKeyType="search"
        isActiveSearch={text.length > 0}
        onChangeText={handleTextChange}
        onSearchClick={handleSearchClick}
      />
    </s.Root>
  );
};
