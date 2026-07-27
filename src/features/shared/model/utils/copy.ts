import { PlatformOS } from '@features/shared/model/constants';

export const copyToClipboard = async (text: string) => {
  const safe = text || '';

  if (PlatformOS.WEB) {
    await navigator.clipboard.writeText(safe);

    return;
  }

  const Clipboard = await import('expo-clipboard');
  await Clipboard.setStringAsync(safe);
};
