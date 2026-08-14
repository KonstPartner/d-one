import { useTranslation } from 'react-i18next';

import { Button, IconButton } from '@shared/ui';

import * as s from '../styles/OwnerDiarySelectionToolbar';

type OwnerDiarySelectionToolbarProps = {
  selectedCount: number;

  allSelected: boolean;

  deleting: boolean;
  synchronizing: boolean;
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
  synchronizeDisabled,

  onToggleAll,
  onSynchronize,
  onDelete,
  onClose,
}: OwnerDiarySelectionToolbarProps) => {
  const { t } = useTranslation();

  return (
    <s.Root>
      <s.Count>
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
          tone="secondary"
          variant="outline"
          size="md"
          onPress={onToggleAll}
        >
          <s.SecondaryActionText>
            {t(
              allSelected
                ? 'diary.selection.clearAll'
                : 'diary.selection.selectAll'
            )}
          </s.SecondaryActionText>
        </Button>

        <Button
          accessibilityLabel={t('diary.selection.synchronize')}
          disabled={synchronizeDisabled}
          loading={synchronizing}
          tone="primary"
          variant="outline"
          size="md"
          onPress={onSynchronize}
        >
          <s.SecondaryActionText>
            {t('diary.selection.synchronize')}
          </s.SecondaryActionText>
        </Button>

        <Button
          accessibilityLabel={t('diary.selection.delete')}
          disabled={selectedCount === 0 || synchronizing}
          loading={deleting}
          tone="danger"
          variant="solid"
          size="md"
          onPress={onDelete}
        >
          <s.DeleteActionText>{t('diary.selection.delete')}</s.DeleteActionText>
        </Button>

        <s.CloseView>
          <IconButton
            icon="close"
            accessibilityLabel={t('diary.selection.close')}
            disabled={deleting || synchronizing}
            tone="secondary"
            variant="solid"
            size="md"
            onPress={onClose}
          />
        </s.CloseView>
      </s.Actions>
    </s.Root>
  );
};
