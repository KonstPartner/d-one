import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import * as ss from '@shared/styles';
import { Button, IconButton } from '@shared/ui';

import * as s from '../styles/OwnerDiarySelectionToolbar';

type OwnerDiarySelectionToolbarProps = {
  selectedCount: number;

  allSelected: boolean;

  deleting: boolean;
  synchronizing: boolean;

  operationsDisabled: boolean;
  synchronizeDisabled: boolean;

  onToggleAll: () => void;
  onSynchronize: () => void;
  onDelete: () => void;
  onClose: () => void;
};

export const OwnerDiarySelectionToolbar = ({
  selectedCount,

  allSelected,

  deleting,
  synchronizing,

  operationsDisabled,
  synchronizeDisabled,

  onToggleAll,
  onSynchronize,
  onDelete,
  onClose,
}: OwnerDiarySelectionToolbarProps) => {
  const theme = useTheme();

  const { t } = useTranslation();

  return (
    <s.Root>
      <s.Count style={ss.Subheading(theme)}>
        {t('diary.selection.selected', {
          count: selectedCount,
        })}
      </s.Count>

      <s.Actions>
        <Button
          accessibilityLabel={t(
            allSelected
              ? 'diary.selection.clearAll'
              : 'diary.selection.selectAll'
          )}
          disabled={deleting || synchronizing}
          tone="input"
          onPress={onToggleAll}
        >
          <s.SecondaryActionText style={ss.Text(theme)}>
            {t(
              allSelected
                ? 'diary.selection.clearAll'
                : 'diary.selection.selectAll'
            )}
          </s.SecondaryActionText>
        </Button>

        <Button
          accessibilityLabel={t('diary.selection.synchronize')}
          disabled={operationsDisabled || synchronizeDisabled}
          loading={synchronizing}
          tone="primary"
          onPress={onSynchronize}
        >
          <s.DeleteActionText style={ss.Text(theme)}>
            {t('diary.selection.synchronize')}
          </s.DeleteActionText>
        </Button>

        <Button
          accessibilityLabel={t('diary.selection.delete')}
          disabled={operationsDisabled || selectedCount === 0 || synchronizing}
          loading={deleting}
          tone="danger"
          onPress={onDelete}
        >
          <s.DeleteActionText style={ss.Text(theme)}>
            {t('diary.selection.delete')}
          </s.DeleteActionText>
        </Button>

        <s.CloseView>
          <IconButton
            icon="close"
            accessibilityLabel={t('diary.selection.close')}
            disabled={deleting || synchronizing}
            tone="muted"
            variant="solid"
            onPress={onClose}
          />
        </s.CloseView>
      </s.Actions>
    </s.Root>
  );
};
