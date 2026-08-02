import { useCallback, useState } from 'react';
import { Share as NativeShare } from 'react-native';

import { PlatformOS } from '../constants/platformOS';

type ShareFileUri = string | null | undefined;

type ShareContent = {
  title?: string;
  message?: string;
  linkUrl?: string;
  fileUri?: ShareFileUri;
  fileUris?: ShareFileUri[];
  getFileUris?: () => Promise<ShareFileUri[]>;
  mimeType?: string;
};

const normalizeFileUri = (uri: string) => {
  const trimmedUri = uri.trim();

  if (PlatformOS.WEB || /^(file|content|data):/i.test(trimmedUri)) {
    return trimmedUri;
  }

  return `file://${trimmedUri}`;
};

const buildShareMessage = ({
  message,
  linkUrl,
}: Pick<ShareContent, 'message' | 'linkUrl'>) => {
  return [message?.trim(), linkUrl?.trim()].filter(Boolean).join('\n');
};

const resolveFileUris = async ({
  fileUri,
  fileUris,
  getFileUris,
}: Pick<ShareContent, 'fileUri' | 'fileUris' | 'getFileUris'>) => {
  const asyncFileUris = getFileUris ? await getFileUris() : [];

  return [fileUri, ...(fileUris ?? []), ...asyncFileUris]
    .filter((uri): uri is string => Boolean(uri?.trim()))
    .map(normalizeFileUri);
};

const useShareContent = (defaultContent: ShareContent = {}) => {
  const [isSharing, setIsSharing] = useState(false);

  const onShare = useCallback(
    async (content: ShareContent = {}) => {
      if (isSharing) {
        return;
      }

      setIsSharing(true);

      try {
        const shareContent = {
          ...defaultContent,
          ...content,
        };

        const message = buildShareMessage(shareContent);
        const fileUris = await resolveFileUris(shareContent);

        if (!message && fileUris.length === 0) {
          return;
        }

        if (PlatformOS.WEB || fileUris.length === 0) {
          await NativeShare.share({
            title: shareContent.title,
            message,
            url: PlatformOS.IOS ? shareContent.linkUrl : undefined,
          });

          return;
        }

        const Share = (await import('react-native-share')).default;

        await Share.open({
          title: shareContent.title,
          message,
          url: fileUris.length === 1 ? fileUris[0] : undefined,
          urls: fileUris.length > 1 ? fileUris : undefined,
          type: shareContent.mimeType,
          failOnCancel: false,
        });
      } finally {
        setIsSharing(false);
      }
    },
    [defaultContent, isSharing]
  );

  return {
    isSharing,
    onShare,
  };
};

export default useShareContent;
