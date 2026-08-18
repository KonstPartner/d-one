import {
  type ComponentProps,
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
} from 'react';
import type { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { usePathname } from 'expo-router';

export type HeaderMenuItem = {
  key: string;
  labelKey: string;
  icon?: ComponentProps<typeof Ionicons>['name'];
  placement?: 'default' | 'bottom';

  onPress: () => void;

  destructive?: boolean;
  disabled?: boolean;
};

type HeaderMenuLayers = Record<string, HeaderMenuItem[]>;

type HeaderMenuState = Record<string, HeaderMenuLayers>;

type HeaderMenuContextValue = {
  getItems: (pathname: string) => HeaderMenuItem[];

  setItems: (
    pathname: string,
    sourceKey: string,
    items: HeaderMenuItem[]
  ) => void;

  clearItems: (pathname: string, sourceKey: string) => void;
};

const HeaderMenuContext = createContext<HeaderMenuContextValue | null>(null);

export const HeaderMenuProvider = ({ children }: PropsWithChildren) => {
  const [state, setState] = useState<HeaderMenuState>({});

  const getItems = useCallback(
    (pathname: string): HeaderMenuItem[] => {
      const layers = state[pathname];

      if (!layers) {
        return [];
      }

      const uniqueItems = new Map<string, HeaderMenuItem>();

      for (const item of Object.values(layers).flat()) {
        uniqueItems.set(item.key, item);
      }

      return Array.from(uniqueItems.values());
    },
    [state]
  );

  const setItems = useCallback(
    (pathname: string, sourceKey: string, items: HeaderMenuItem[]): void => {
      setState((currentState) => ({
        ...currentState,

        [pathname]: {
          ...(currentState[pathname] ?? {}),

          [sourceKey]: items,
        },
      }));
    },
    []
  );

  const clearItems = useCallback(
    (pathname: string, sourceKey: string): void => {
      setState((currentState) => {
        const layers = currentState[pathname];

        if (!layers) {
          return currentState;
        }

        const nextLayers = {
          ...layers,
        };

        delete nextLayers[sourceKey];

        const nextState = {
          ...currentState,
        };

        if (Object.keys(nextLayers).length === 0) {
          delete nextState[pathname];
        } else {
          nextState[pathname] = nextLayers;
        }

        return nextState;
      });
    },
    []
  );

  const value = useMemo<HeaderMenuContextValue>(
    () => ({
      getItems,
      setItems,
      clearItems,
    }),
    [clearItems, getItems, setItems]
  );

  return (
    <HeaderMenuContext.Provider value={value}>
      {children}
    </HeaderMenuContext.Provider>
  );
};

export const useHeaderMenuContext = (): HeaderMenuContextValue => {
  const context = useContext(HeaderMenuContext);

  if (!context) {
    throw new Error(
      'useHeaderMenuContext must be used within HeaderMenuProvider'
    );
  }

  return context;
};

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
    }, [clearItems, items, pathname, setItems, sourceKey])
  );
};
