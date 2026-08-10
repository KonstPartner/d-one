import { Platform } from 'react-native';

export const copyToClipboard = async (text: string): Promise<void> => {
  const value = text || '';

  if (Platform.OS === 'web') {
    await navigator.clipboard.writeText(value);

    return;
  }

  const Clipboard = await import('expo-clipboard');

  await Clipboard.setStringAsync(value);
};
