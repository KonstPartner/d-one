import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import * as ss from '@shared/styles';
import { Button, IconButton } from '@shared/ui';

import * as s from '../styles/OwnerCloudDiarySelectionToolbar';

type OwnerCloudDiarySelectionToolbarProps = {
  selectedCount: number;

  allSelected: boolean;

  downloadDisabled: boolean;
  downloading: boolean;

  onToggleAll: () => void;
  onDownload: () => void;
  onClose: () => void;
};

export const OwnerCloudDiarySelectionToolbar = ({
  selectedCount,

  allSelected,

  downloadDisabled,
  downloading,

  onToggleAll,
  onDownload,
  onClose,
}: OwnerCloudDiarySelectionToolbarProps) => {
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
          disabled={downloading}
          tone="input"
          onPress={onToggleAll}
        >
          <s.ActionText style={ss.Text(theme)}>
            {t(
              allSelected
                ? 'diary.selection.clearAll'
                : 'diary.selection.selectAll'
            )}
          </s.ActionText>
        </Button>

        <Button
          accessibilityLabel={t('diary.cloud.download.action')}
          disabled={downloadDisabled}
          loading={downloading}
          tone="primary"
          onPress={onDownload}
        >
          <s.DownloadText style={ss.Text(theme)}>
            {t('diary.cloud.download.action')}
          </s.DownloadText>
        </Button>

        <s.CloseView>
          <IconButton
            icon="close"
            accessibilityLabel={t('diary.selection.close')}
            disabled={downloading}
            tone="muted"
            variant="solid"
            onPress={onClose}
          />
        </s.CloseView>
      </s.Actions>
    </s.Root>
  );
};
