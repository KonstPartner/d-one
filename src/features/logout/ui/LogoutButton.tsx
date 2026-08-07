import { useTranslation } from 'react-i18next';

import { useLogout } from '../model/useLogout';
import * as s from '../styles/LogoutButton';

export const LogoutButton = () => {
  const { t } = useTranslation();

  const { logout, isPending } = useLogout();

  return (
    <s.Root onPress={logout} disabled={isPending} onDisableSpinner>
      <s.Text>{t('auth.buttons.logout')}</s.Text>
    </s.Root>
  );
};
