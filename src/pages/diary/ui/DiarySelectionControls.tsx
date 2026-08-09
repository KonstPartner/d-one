import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ConfirmDialog } from '@shared/ui';

import * as s from '../styles/Diary';

type DiarySelectionControlsProps = {
  availableCount: number;
  selectedCount: number;

  allAvailableSelected: boolean;
  selectAllChecked: boolean | 'mixed';

  deletePending: boolean;
  deleteConfirmationVisible: boolean;

  onToggleSelectAll: () => void;
  onSynchronize: () => void;
  onRequestDelete: () => void;
  onClose: () => void;

  onConfirmDelete: () => void | Promise<void>;
  onCloseDeleteConfirmation: () => void;
};

export const DiarySelectionControls = ({
  availableCount,
  selectedCount,

  allAvailableSelected,
  selectAllChecked,

  deletePending,
  deleteConfirmationVisible,

  onToggleSelectAll,
  onSynchronize,
  onRequestDelete,
  onClose,

  onConfirmDelete,
  onCloseDeleteConfirmation,
}: DiarySelectionControlsProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const selectionEmpty = selectedCount === 0;

  const selectionDeleteDisabled = selectionEmpty || deletePending;

  return (
    <>
      <View style={s.SelectionToolbar(theme)}>
        <Pressable
          disabled={availableCount === 0}
          accessibilityRole="checkbox"
          accessibilityLabel={t(
            allAvailableSelected
              ? 'diary.selection.clearAll'
              : 'diary.selection.selectAll'
          )}
          accessibilityState={{
            checked: selectAllChecked,
            disabled: availableCount === 0,
          }}
          onPress={onToggleSelectAll}
          style={s.SelectionAction(theme, 'primary', availableCount === 0)}
        >
          <Ionicons
            name={
              allAvailableSelected
                ? 'checkbox'
                : selectedCount > 0
                  ? 'remove-circle'
                  : 'square-outline'
            }
            size={theme.size.base}
            color={theme.colors.white}
          />

          <Text style={s.SelectionActionText(theme)}>
            {t(
              allAvailableSelected
                ? 'diary.selection.clearAll'
                : 'diary.selection.selectAll'
            )}
          </Text>
        </Pressable>

        <Text style={s.SelectionCount(theme)}>
          {t('diary.selection.selected', {
            count: selectedCount,
          })}
        </Text>

        <Pressable
          disabled={selectionEmpty}
          accessibilityRole="button"
          accessibilityLabel={t('diary.selection.synchronize')}
          accessibilityState={{
            disabled: selectionEmpty,
          }}
          onPress={onSynchronize}
          style={s.SelectionAction(theme, 'primary', selectionEmpty)}
        >
          <Ionicons
            name="cloud-upload-outline"
            size={theme.size.base}
            color={theme.colors.white}
          />

          <Text style={s.SelectionActionText(theme)}>
            {t('diary.selection.synchronize')}
          </Text>
        </Pressable>

        <Pressable
          disabled={selectionDeleteDisabled}
          accessibilityRole="button"
          accessibilityLabel={t('diary.selection.delete')}
          accessibilityState={{
            disabled: selectionDeleteDisabled,
          }}
          onPress={onRequestDelete}
          style={s.SelectionAction(theme, 'danger', selectionDeleteDisabled)}
        >
          <Text style={s.SelectionActionText(theme)}>
            {t('diary.selection.delete')}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('diary.selection.close')}
          onPress={onClose}
          style={s.CloseSelectionButton(theme)}
        >
          <Ionicons
            name="close"
            size={theme.size.md}
            color={theme.colors.text}
          />
        </Pressable>
      </View>

      <ConfirmDialog
        visible={deleteConfirmationVisible}
        title={t('diary.selection.deleteConfirmTitle')}
        description={t('diary.selection.deleteConfirmDescription', {
          count: selectedCount,
        })}
        confirmLabel={t('diary.selection.delete')}
        confirmTone="danger"
        confirmDisabled={deletePending}
        onConfirm={onConfirmDelete}
        onClose={onCloseDeleteConfirmation}
      />
    </>
  );
};
