import { useTranslation } from 'react-i18next';

import { Button } from '@shared/ui';

import * as s from '../styles/OwnerDiarySelectionToolbar';

type OwnerDiarySelectionToolbarProps = {
  selectedCount: number;

  allSelected: boolean;

  deleting: boolean;

  onToggleAll: () => void;
  onDelete: () => void;
  onClose: () => void;
};

export const OwnerDiarySelectionToolbar = ({
  selectedCount,

  allSelected,

  deleting,

  onToggleAll,
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
          disabled={deleting}
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
          accessibilityLabel={t('diary.selection.delete')}
          disabled={selectedCount === 0}
          loading={deleting}
          tone="danger"
          variant="solid"
          size="md"
          onPress={onDelete}
        >
          <s.DeleteActionText>{t('diary.selection.delete')}</s.DeleteActionText>
        </Button>

        <Button
          accessibilityLabel={t('diary.selection.close')}
          disabled={deleting}
          tone="secondary"
          variant="ghost"
          size="md"
          onPress={onClose}
        >
          <s.SecondaryActionText>
            {t('diary.selection.close')}
          </s.SecondaryActionText>
        </Button>
      </s.Actions>
    </s.Root>
  );
};
