import { Platform } from 'react-native';

export const PlatformOS = {
  ANDROID: Platform.OS === 'android',

  IOS: Platform.OS === 'ios',

  MACOS: Platform.OS === 'macos',

  WEB: Platform.OS === 'web',

  WINDOWS: Platform.OS === 'windows',
} as const;
