import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import {
  DIARY_ENTRY_SEARCH_FIELDS,
  type DiaryEntrySearchField,
  isDiaryEntryTextSearchField,
} from '@entities/diary';

import { isDiarySearchInputAllowed } from '../model/search';
import * as s from '../styles/DiarySearch';

const SEARCH_DEBOUNCE_MS = 400;

type DiarySearchProps = {
  text: string;
  field: DiaryEntrySearchField;
  endActions?: ReactNode;

  onTextChange: (text: string) => void;

  onApplyText: () => void;

  onFieldChange: (field: DiaryEntrySearchField) => void;

  onClear: () => void;
};

export const DiarySearch = ({
  text,
  field,
  endActions,
  onTextChange,
  onApplyText,
  onFieldChange,
  onClear,
}: DiarySearchProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [selectorOpened, setSelectorOpened] = useState(false);

  const applyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

      setSelectorOpened(false);

      onFieldChange(nextField);
    },
    [clearApplyTimer, onFieldChange]
  );

  const handleClear = useCallback(() => {
    clearApplyTimer();

    onClear();
  }, [clearApplyTimer, onClear]);

  return (
    <s.Root>
      <s.TopRow>
        <s.InputShell>
          <Ionicons
            name="search-outline"
            size={theme.size.md}
            color={theme.colors.muted}
          />

          <s.Input
            accessibilityLabel={t('diary.search.inputAccessibilityLabel')}
            value={text}
            placeholder={t('diary.search.placeholder')}
            placeholderTextColor={theme.colors.muted}
            keyboardType={
              isDiaryEntryTextSearchField(field) ? 'default' : 'decimal-pad'
            }
            inputMode={
              isDiaryEntryTextSearchField(field) ? 'search' : 'decimal'
            }
            returnKeyType="search"
            onChangeText={handleTextChange}
          />

          {text.length > 0 && (
            <s.ClearButton
              accessibilityRole="button"
              accessibilityLabel={t('diary.search.clearAccessibilityLabel')}
              onPress={handleClear}
              hitSlop={8}
            >
              <Ionicons
                name="close-circle"
                size={theme.size.md}
                color={theme.colors.muted}
              />
            </s.ClearButton>
          )}
        </s.InputShell>

        {endActions !== undefined && <s.EndActions>{endActions}</s.EndActions>}
      </s.TopRow>

      <s.FieldSelector
        $opened={selectorOpened}
        accessibilityRole="button"
        accessibilityLabel={t('diary.search.fieldAccessibilityLabel')}
        accessibilityState={{
          expanded: selectorOpened,
        }}
        onPress={() => {
          setSelectorOpened((opened) => !opened);
        }}
      >
        <s.FieldSelectorText numberOfLines={1}>
          {t(`diary.search.fields.${field}`)}
        </s.FieldSelectorText>

        <Ionicons
          name={selectorOpened ? 'chevron-up' : 'chevron-down'}
          size={theme.size.sm}
          color={theme.colors.muted}
        />
      </s.FieldSelector>

      {selectorOpened && (
        <s.Options>
          {DIARY_ENTRY_SEARCH_FIELDS.map((option) => {
            const selected = option === field;

            return (
              <s.Option
                key={option}
                $selected={selected}
                accessibilityRole="radio"
                accessibilityState={{
                  checked: selected,
                }}
                onPress={() => {
                  handleFieldChange(option);
                }}
              >
                <s.OptionText $selected={selected}>
                  {t(`diary.search.fields.${option}`)}
                </s.OptionText>

                {selected && (
                  <Ionicons
                    name="checkmark"
                    size={theme.size.sm}
                    color={theme.colors.primary}
                  />
                )}
              </s.Option>
            );
          })}
        </s.Options>
      )}
    </s.Root>
  );
};
