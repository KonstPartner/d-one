import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

export type HeaderMenuItem = {
  key: string;
  labelKey: string;
  icon?: ComponentProps<typeof Ionicons>['name'];

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
    [getItems, setItems, clearItems]
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
