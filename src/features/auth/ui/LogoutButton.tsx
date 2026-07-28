import { Text } from 'react-native';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import { Button } from '@entities/shared/ui';
import { useLogout } from '@features/auth/api/hooks';
import * as styles from '@features/auth/styles/LogoutButton';

const LogoutButton = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const { mutate: logout, isPending } = useLogout();

  const handleLogout = () => {
    logout();
  };

  return (
    <Button
      style={styles.ButtonStyle(theme, isPending)}
      onPress={handleLogout}
      disabled={isPending}
      onDisableSpinner
    >
      <Text style={styles.ButtonText(theme)}>{t('auth.buttons.logout')}</Text>
    </Button>
  );
};

export default LogoutButton;
