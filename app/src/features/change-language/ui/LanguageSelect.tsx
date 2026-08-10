import { Modal } from 'react-native';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import type { AppLanguage } from '@shared/i18n';

import { useChangeLanguage } from '../model/useChangeLanguage';
import * as s from '../styles/LanguageSelect';

type LanguageOption = {
  value: AppLanguage;
  label: string;
};

const LANGUAGE_OPTIONS: readonly LanguageOption[] = [
  {
    value: 'en',
    label: 'English',
  },
  {
    value: 'ru',
    label: 'Русский',
  },
];

const getLanguageLabel = (language: AppLanguage): string => {
  return (
    LANGUAGE_OPTIONS.find((option) => option.value === language)?.label ??
    language
  );
};

export const LanguageSelect = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const {
    currentLanguage,
    draftLanguage,

    isOpen,
    isDirty,
    isApplying,

    open,
    close,
    pick,
    apply,
  } = useChangeLanguage();

  const displayedLanguage = isDirty ? draftLanguage : currentLanguage;

  return (
    <s.Wrapper>
      <s.FieldRow>
        <s.Field onPress={open} accessibilityRole="button">
          <s.FieldLabel>{t('common.language')}</s.FieldLabel>

          <s.FieldValueRow>
            <s.FieldValue numberOfLines={1}>
              {getLanguageLabel(displayedLanguage)}
            </s.FieldValue>

            <s.Chevron>▾</s.Chevron>
          </s.FieldValueRow>
        </s.Field>

        {isDirty && (
          <s.ApplyButton
            onPress={() => {
              void apply();
            }}
            disabled={isApplying}
            accessibilityRole="button"
            accessibilityLabel={t('common.language')}
            style={s.getApplyButtonStyle(isApplying)}
          >
            <s.ApplyButtonText>✓</s.ApplyButtonText>
          </s.ApplyButton>
        )}
      </s.FieldRow>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <s.Backdrop onPress={close}>
          <s.ModalCard
            onPress={(event) => {
              event.stopPropagation();
            }}
          >
            <s.ModalTitle>{t('common.language')}</s.ModalTitle>

            <s.ModalList>
              {LANGUAGE_OPTIONS.map((option) => {
                const selected = option.value === draftLanguage;

                return (
                  <s.ModalItem
                    key={option.value}
                    accessibilityRole="radio"
                    accessibilityState={{
                      selected,
                    }}
                    onPress={() => {
                      pick(option.value);
                    }}
                    style={s.getModalItemStyle(theme, selected)}
                  >
                    <s.ModalItemText
                      style={s.getModalItemTextStyle(theme, selected)}
                    >
                      {option.label}
                    </s.ModalItemText>

                    {selected ? <s.Check>✓</s.Check> : <s.CheckPlaceholder />}
                  </s.ModalItem>
                );
              })}
            </s.ModalList>

            <s.CancelButton onPress={close}>
              <s.CancelButtonText>{t('common.cancel')}</s.CancelButtonText>
            </s.CancelButton>
          </s.ModalCard>
        </s.Backdrop>
      </Modal>
    </s.Wrapper>
  );
};
