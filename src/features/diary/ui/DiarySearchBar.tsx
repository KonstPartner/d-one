import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';

import * as globalStyles from '@features/shared/styles/global';

import { useDiaryListStore } from '../model/store';
import type { DiarySearchField } from '../model/types';
import { DIARY_SEARCH_FIELDS, isDiaryTextSearchField } from '../model/types';
import * as styles from '../styles/DiarySearchBar';

const SEARCH_DEBOUNCE_MS = 400;
const NUMERIC_SEARCH_INPUT_PATTERN = /^\d*(?:[.,]\d?)?$/;
const VALID_NUMERIC_SEARCH_PATTERN = /^\d+(?:[.,]\d)?$/;

type DiarySearchBarProps = {
  filterModalVisible: boolean;
  filtersApplied: boolean;
  onOpenFilters: () => void;
  onCreateEntry: () => void;
};

const normalizeSearchQuery = (
  field: DiarySearchField,
  text: string
): string | number | null => {
  const trimmedText = text.trim();

  if (isDiaryTextSearchField(field)) {
    return trimmedText.length >= 2 ? trimmedText : null;
  }

  if (!VALID_NUMERIC_SEARCH_PATTERN.test(trimmedText)) {
    return null;
  }

  const value = Number(trimmedText.replace(',', '.'));

  return Number.isFinite(value) ? value : null;
};

const DiarySearchBar = ({
  filterModalVisible,
  filtersApplied,
  onOpenFilters,
  onCreateEntry,
}: DiarySearchBarProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [selectorOpened, setSelectorOpened] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    searchText,
    searchField,
    setSearchText,
    setSearchField,
    applySearchQuery,
  } = useDiaryListStore(
    useShallow((state) => ({
      searchText: state.searchText,
      searchField: state.appliedFilters.search.field,
      setSearchText: state.setSearchText,
      setSearchField: state.setSearchField,
      applySearchQuery: state.applySearchQuery,
    }))
  );

  const clearSearchTimer = useCallback(() => {
    if (searchTimerRef.current !== null) {
      clearTimeout(searchTimerRef.current);
      searchTimerRef.current = null;
    }
  }, []);

  useEffect(
    () => () => {
      clearSearchTimer();
    },
    [clearSearchTimer]
  );

  const handleTextChange = (text: string) => {
    if (
      !isDiaryTextSearchField(searchField) &&
      !NUMERIC_SEARCH_INPUT_PATTERN.test(text)
    ) {
      return;
    }

    setSearchText(text);
    clearSearchTimer();

    if (text.length === 0) {
      applySearchQuery(null);

      return;
    }

    searchTimerRef.current = setTimeout(() => {
      searchTimerRef.current = null;
      applySearchQuery(normalizeSearchQuery(searchField, text));
    }, SEARCH_DEBOUNCE_MS);
  };

  const handleSelectField = (field: DiarySearchField) => {
    clearSearchTimer();
    setSelectorOpened(false);

    if (field !== searchField) {
      setSearchField(field);
    }
  };

  const handleClear = () => {
    clearSearchTimer();
    setSearchText('');
    applySearchQuery(null);
  };

  return (
    <View style={styles.Root}>
      <View style={styles.TopRow(theme)}>
        <View style={styles.InputShell(theme)}>
          <Ionicons
            name="search-outline"
            size={theme.size.md}
            color={theme.colors.muted}
          />

          <TextInput
            accessibilityLabel={t('diary.search.inputAccessibilityLabel')}
            value={searchText}
            placeholder={t('diary.search.placeholder')}
            placeholderTextColor={theme.colors.muted}
            keyboardType={
              isDiaryTextSearchField(searchField) ? 'default' : 'decimal-pad'
            }
            inputMode={
              isDiaryTextSearchField(searchField) ? 'search' : 'decimal'
            }
            returnKeyType="search"
            onChangeText={handleTextChange}
            style={styles.Input(theme)}
          />

          {searchText.length > 0 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('diary.search.clearAccessibilityLabel')}
              onPress={handleClear}
              hitSlop={8}
              style={styles.ClearButton(theme)}
            >
              <Ionicons
                name="close-circle"
                size={theme.size.md}
                color={theme.colors.muted}
              />
            </Pressable>
          )}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('diary.filters.openAccessibilityLabel')}
          accessibilityState={{
            expanded: filterModalVisible,
            selected: filtersApplied,
          }}
          onPress={onOpenFilters}
          style={globalStyles.IconButton(
            theme,
            filtersApplied ? 'primary' : 'secondary',
            'lg'
          )}
        >
          <Ionicons
            name="filter-outline"
            size={theme.size.md}
            color={filtersApplied ? theme.colors.white : theme.colors.primary}
          />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('diary.form.openCreateAccessibilityLabel')}
          onPress={onCreateEntry}
          style={globalStyles.IconButton(theme, 'primary', 'lg')}
        >
          <Ionicons
            name="add"
            size={theme.size.lg}
            color={theme.colors.white}
          />
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('diary.search.fieldAccessibilityLabel')}
        accessibilityState={{ expanded: selectorOpened }}
        onPress={() => setSelectorOpened((opened) => !opened)}
        style={styles.FieldSelector(theme, selectorOpened)}
      >
        <Text numberOfLines={1} style={styles.FieldSelectorText(theme)}>
          {t(`diary.search.fields.${searchField}`)}
        </Text>

        <Ionicons
          name={selectorOpened ? 'chevron-up' : 'chevron-down'}
          size={theme.size.sm}
          color={theme.colors.muted}
        />
      </Pressable>

      {selectorOpened && (
        <View style={styles.Options(theme)}>
          {DIARY_SEARCH_FIELDS.map((field) => {
            const selected = field === searchField;

            return (
              <Pressable
                key={field}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                onPress={() => handleSelectField(field)}
                style={styles.Option(theme, selected)}
              >
                <Text style={styles.OptionText(theme, selected)}>
                  {t(`diary.search.fields.${field}`)}
                </Text>

                {selected && (
                  <Ionicons
                    name="checkmark"
                    size={theme.size.sm}
                    color={theme.colors.primary}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default DiarySearchBar;
