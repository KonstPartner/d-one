import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { create } from 'zustand';

export type NetworkStatus = 'unknown' | 'offline' | 'online';

type NetworkState = {
  status: NetworkStatus;
  setStatus: (status: NetworkStatus) => void;
};

const resolveNetworkStatus = (networkState: NetInfoState): NetworkStatus => {
  if (
    networkState.isConnected === false ||
    networkState.isInternetReachable === false
  ) {
    return 'offline';
  }

  if (networkState.isConnected === true) {
    return 'online';
  }

  return 'unknown';
};

export const useNetworkStore = create<NetworkState>((set) => ({
  status: 'unknown',

  setStatus: (status) => {
    set({ status });
  },
}));

let unsubscribeNetwork: (() => void) | null = null;

export const startNetworkListener = (): (() => void) => {
  if (unsubscribeNetwork !== null) {
    return () => undefined;
  }

  const unsubscribe = NetInfo.addEventListener((networkState) => {
    useNetworkStore.getState().setStatus(resolveNetworkStatus(networkState));
  });

  unsubscribeNetwork = unsubscribe;

  return () => {
    if (unsubscribeNetwork !== unsubscribe) {
      return;
    }

    unsubscribe();
    unsubscribeNetwork = null;

    useNetworkStore.getState().setStatus('unknown');
  };
};
