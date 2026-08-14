import { useTranslation } from 'react-i18next';

import { Button, IconButton } from '@shared/ui';

import * as s from '../styles/OwnerCloudDiarySelectionToolbar';

type OwnerCloudDiarySelectionToolbarProps = {
  selectedCount: number;

  allSelected: boolean;

  onToggleAll: () => void;
  onClose: () => void;
};

export const OwnerCloudDiarySelectionToolbar = ({
  selectedCount,

  allSelected,

  onToggleAll,
  onClose,
}: OwnerCloudDiarySelectionToolbarProps) => {
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
          tone="secondary"
          variant="outline"
          size="md"
          onPress={onToggleAll}
        >
          <s.ActionText>
            {t(
              allSelected
                ? 'diary.selection.clearAll'
                : 'diary.selection.selectAll'
            )}
          </s.ActionText>
        </Button>

        <s.CloseView>
          <IconButton
            icon="close"
            accessibilityLabel={t('diary.selection.close')}
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
