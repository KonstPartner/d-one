import { Platform } from 'react-native';

const ANDROID = Platform.OS === 'android';

const IOS = Platform.OS === 'ios';

const MACOS = Platform.OS === 'macos';

const WEB = Platform.OS === 'web';

const WINDOWS = Platform.OS === 'windows';

export const PlatformOS = { ANDROID, IOS, MACOS, WEB, WINDOWS };
