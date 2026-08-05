import {
  createContext,
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

export const HeaderMenuProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, setState] = useState<HeaderMenuState>({});

  const getItems = useCallback(
    (pathname: string) => {
      const layers = state[pathname];
      if (!layers) {
        return [];
      }

      const merged = Object.values(layers).flat();

      const uniq = new Map<string, HeaderMenuItem>();
      for (const item of merged) {
        uniq.set(item.key, item);
      }

      return Array.from(uniq.values());
    },
    [state]
  );

  const setItems = useCallback(
    (pathname: string, sourceKey: string, items: HeaderMenuItem[]) => {
      setState((prev) => ({
        ...prev,
        [pathname]: {
          ...(prev[pathname] ?? {}),
          [sourceKey]: items,
        },
      }));
    },
    []
  );

  const clearItems = useCallback((pathname: string, sourceKey: string) => {
    setState((prev) => {
      const pathnameLayers = prev[pathname];
      if (!pathnameLayers) {
        return prev;
      }

      const nextLayers = { ...pathnameLayers };
      delete nextLayers[sourceKey];

      const next = { ...prev };
      if (Object.keys(nextLayers).length === 0) {
        delete next[pathname];
      } else {
        next[pathname] = nextLayers;
      }

      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ getItems, setItems, clearItems }),
    [getItems, setItems, clearItems]
  );

  return (
    <HeaderMenuContext.Provider value={value}>
      {children}
    </HeaderMenuContext.Provider>
  );
};

export const useHeaderMenuContext = () => {
  const ctx = useContext(HeaderMenuContext);
  if (!ctx) {
    throw new Error(
      'useHeaderMenuContext must be used within HeaderMenuProvider'
    );
  }

  return ctx;
};
