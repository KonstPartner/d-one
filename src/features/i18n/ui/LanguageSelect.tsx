import { useMemo, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import {
  AppLanguage,
  i18n,
  saveLanguage,
  setAppLanguage,
} from '@features/i18n/model';
import * as styles from '@features/i18n/styles/LanguageSelect';
import * as globalStyles from '@features/shared/styles/global';

type Option = { value: AppLanguage; label: string };

const SUPPORTED: AppLanguage[] = ['en'];

const normalizeLanguage = (lng?: string): AppLanguage => {
  const base = (lng ?? '').split('-')[0] as AppLanguage;

  return SUPPORTED.includes(base) ? base : 'en';
};

const LanguageSelect = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const options: Option[] = useMemo(
    () => [{ value: 'en', label: 'English' }],
    []
  );

  const current = normalizeLanguage(i18n.resolvedLanguage ?? i18n.language);

  const [draft, setDraft] = useState<AppLanguage>(current);
  const [isOpen, setIsOpen] = useState(false);

  const isDirty = draft !== current;

  const currentLabel =
    options.find((o) => o.value === (isDirty ? draft : current))?.label ??
    (isDirty ? draft : current);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const pick = (lng: AppLanguage) => {
    setDraft(lng);
    close();
  };

  const apply = async () => {
    if (!isDirty) {
      return;
    }
    await setAppLanguage(draft);
    await saveLanguage(draft);
  };

  return (
    <View style={styles.Wrapper}>
      <View style={globalStyles.ContainerFlex('row', '', 'stretch', 10)}>
        <Pressable
          onPress={open}
          style={styles.Field(theme)}
          accessibilityRole="button"
        >
          <Text style={styles.FieldLabel(theme)}>{t('common.language')}</Text>

          <View
            style={globalStyles.ContainerFlex('row', 'space-between', 'center')}
          >
            <Text style={styles.FieldValue(theme)} numberOfLines={1}>
              {currentLabel}
            </Text>
            <Text style={styles.Chevron(theme)}>▾</Text>
          </View>
        </Pressable>

        {isDirty && (
          <Pressable onPress={apply} style={styles.ApplyButton(theme)}>
            <Text style={styles.ApplyButtonText}>✓</Text>
          </Pressable>
        )}
      </View>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <Pressable onPress={close} style={styles.Backdrop}>
          <Pressable onPress={() => {}} style={styles.ModalCard(theme)}>
            <Text style={styles.ModalTitle(theme)}>{t('common.language')}</Text>

            <View style={styles.ModalList}>
              {options.map((o) => {
                const isSelected = o.value === draft;

                return (
                  <Pressable
                    key={o.value}
                    onPress={() => pick(o.value)}
                    style={[
                      globalStyles.ContainerFlex(
                        'row',
                        'space-between',
                        'center'
                      ),
                      styles.ModalItem(theme),
                      isSelected ? styles.ModalItemSelected(theme) : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.ModalItemText(theme),
                        isSelected ? styles.ModalItemTextSelected(theme) : null,
                      ]}
                    >
                      {o.label}
                    </Text>

                    {isSelected ? (
                      <Text style={styles.Check(theme)}>✓</Text>
                    ) : (
                      <View style={styles.CheckPlaceholder} />
                    )}
                  </Pressable>
                );
              })}
            </View>

            <Pressable onPress={close} style={styles.CancelButton(theme)}>
              <Text style={styles.CancelButtonText}>{t('common.cancel')}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default LanguageSelect;
