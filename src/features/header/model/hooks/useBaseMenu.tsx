import { useCallback, useState } from 'react';

import { HeaderMenuSettings } from '@entities/header/ui';
import type { HeaderMenuItem } from '@features/header/model';

const useToggle = (initial = false) => {
  const [visible, setVisible] = useState(initial);

  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);

  return { visible, open, close };
};

const useHeaderBaseMenu = () => {
  const settings = useToggle(false);

  const baseItems: HeaderMenuItem[] = [
    {
      key: 'settings',
      labelKey: 'header.menu.settings',
      onPress: settings.open,
    },
  ];

  const baseOverlays = [
    <HeaderMenuSettings
      key="settings"
      visible={settings.visible}
      onClose={settings.close}
    />,
  ];

  return { baseItems, baseOverlays };
};

export default useHeaderBaseMenu;
