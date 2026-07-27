import { useCallback, useId } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { usePathname } from 'expo-router';

import {
  HeaderMenuItem,
  useHeaderMenuContext,
} from '@features/header/model/context/menu';

const useHeaderMenu = (items: HeaderMenuItem[], deps: unknown[] = []) => {
  const pathname = usePathname();
  const sourceKey = useId();
  const { setItems, clearItems } = useHeaderMenuContext();

  useFocusEffect(
    useCallback(() => {
      setItems(pathname, sourceKey, items);

      return () => clearItems(pathname, sourceKey);
    }, [pathname, sourceKey, setItems, clearItems, ...deps])
  );
};

export default useHeaderMenu;
