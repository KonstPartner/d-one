/* global jest */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('toastify-react-native', () => ({
  __esModule: true,
  default: ({ children }) => children ?? null,
  Toast: {
    show: jest.fn(),
    hide: jest.fn(),
  },
}));
