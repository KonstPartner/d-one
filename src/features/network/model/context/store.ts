import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { create } from 'zustand';

import type { ConnectionState, NetworkStore } from '../types';

const resolveConnectionState = (
  networkState: NetInfoState
): ConnectionState => {
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

export const useNetworkStore = create<NetworkStore>((set) => ({
  connectionState: 'unknown',

  setConnectionState: (connectionState) => {
    set({ connectionState });
  },
}));

let networkUnsubscribe: (() => void) | null = null;

export const startNetworkListener = (): (() => void) => {
  if (networkUnsubscribe) {
    return () => undefined;
  }

  const unsubscribe = NetInfo.addEventListener((networkState) => {
    const connectionState = resolveConnectionState(networkState);

    useNetworkStore.getState().setConnectionState(connectionState);
  });

  networkUnsubscribe = unsubscribe;

  return () => {
    if (networkUnsubscribe !== unsubscribe) {
      return;
    }

    unsubscribe();
    networkUnsubscribe = null;

    useNetworkStore.getState().setConnectionState('unknown');
  };
};
