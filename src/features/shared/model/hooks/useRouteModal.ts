import { useCallback, useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';

const useRouteModal = (modalName: string) => {
  const { modal, openKey } = useLocalSearchParams<{
    modal?: string;
    openKey?: string;
  }>();

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (modal !== modalName || !openKey) {
      return;
    }

    setVisible(true);
  }, [modal, openKey, modalName]);

  const open = useCallback(() => {
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    setVisible(false);

    router.setParams({
      modal: undefined,
      openKey: undefined,
    });
  }, []);

  return {
    visible,
    open,
    close,
  };
};

export default useRouteModal;
