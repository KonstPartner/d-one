import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import * as s from '../styles/VersionHistory';

type VersionHistoryButtonProps = {
  version: string;
  onPress: () => void;
};

export const VersionHistoryButton = ({
  version,
  onPress,
}: VersionHistoryButtonProps) => {
  const theme = useTheme();

  const { t } = useTranslation();

  return (
    <s.VersionButton
      accessibilityRole="button"
      accessibilityLabel={t('versionHistory.openAccessibilityLabel', {
        version,
      })}
      onPress={onPress}
      style={s.getVersionButtonStyle}
    >
      <s.VersionButtonIcon>
        <Ionicons
          name="information-outline"
          size={18}
          color={theme.colors.shades.primary.text}
        />
      </s.VersionButtonIcon>

      <s.VersionButtonText>
        {t('versionHistory.button', {
          version,
        })}
      </s.VersionButtonText>

      <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
    </s.VersionButton>
  );
};
