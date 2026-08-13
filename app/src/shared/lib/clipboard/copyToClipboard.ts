import { PlatformOS } from '../platform';

export const copyToClipboard = async (text: string): Promise<void> => {
  const value = text || '';

  if (PlatformOS.WEB) {
    await navigator.clipboard.writeText(value);

    return;
  }

  const Clipboard = await import('expo-clipboard');

  await Clipboard.setStringAsync(value);
};
