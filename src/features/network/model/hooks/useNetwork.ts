import { useNetworkStore } from '@features/network/model/context';

export const useNetwork = () => {
  const status = useNetworkStore((state) => state.connectionState);

  return {
    status,
    isOnline: status === 'online',
    isOffline: status === 'offline',
    isUnknown: status === 'unknown',
  };
};
