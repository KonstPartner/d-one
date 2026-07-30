export type ConnectionState = 'unknown' | 'offline' | 'online';

export type NetworkStore = {
  connectionState: ConnectionState;
  setConnectionState: (connectionState: ConnectionState) => void;
};
