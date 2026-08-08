import { useNetworkStore } from './networkState';

export const useNetwork = () => {
  const status = useNetworkStore((state) => state.status);

  return {
    status,
    isOnline: status === 'online',
    isOffline: status === 'offline',
    isUnknown: status === 'unknown',
  };
};
