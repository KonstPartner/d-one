import { useTranslation } from 'react-i18next';

import * as ss from '@shared/styles';
import { Button } from '@shared/ui';

import { useLogout } from '../model/useLogout';
import * as s from '../styles/LogoutButton';

export const LogoutButton = () => {
  const { t } = useTranslation();

  const { logout, isPending, disabled } = useLogout();

  return (
    <Button
      style={ss.FullWidth}
      tone="danger"
      disabled={disabled}
      loading={isPending}
      onPress={logout}
    >
      <s.Text>{t('auth.buttons.logout')}</s.Text>
    </Button>
  );
};
