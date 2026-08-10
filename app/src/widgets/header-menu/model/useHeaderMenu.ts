import { useCallback, useId } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { usePathname } from 'expo-router';

import {
  type HeaderMenuItem,
  useHeaderMenuContext,
} from './HeaderMenuProvider';

export const useHeaderMenu = (items: HeaderMenuItem[]): void => {
  const pathname = usePathname();
  const sourceKey = useId();

  const { setItems, clearItems } = useHeaderMenuContext();

  useFocusEffect(
    useCallback(() => {
      setItems(pathname, sourceKey, items);

      return () => {
        clearItems(pathname, sourceKey);
      };
    }, [pathname, sourceKey, items, setItems, clearItems])
  );
};
