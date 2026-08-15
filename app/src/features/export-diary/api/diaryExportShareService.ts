import { Directory, File, Paths } from 'expo-file-system';

import { PlatformOS } from '@shared/lib/platform';

export type DiaryExportFileTarget = {
  fileUri: string;
  fileName: string;
  fileSize: number;
};

const SHARE_CACHE_DIRECTORY_NAME = 'diaryExportShare';

const SAFE_FILE_NAME_PATTERN = /^[^/\\]+\.(zip|csv)$/i;

const getMimeType = (fileName: string): string =>
  fileName.toLowerCase().endsWith('.csv') ? 'text/csv' : 'application/zip';

const getLocalFilePath = (fileUri: string): string => {
  if (!fileUri.startsWith('file://')) {
    throw new Error('Diary export is not a local file');
  }

  return decodeURIComponent(fileUri.slice('file://'.length));
};

const assertExportFile = (result: DiaryExportFileTarget): void => {
  if (
    result.fileUri.length === 0 ||
    !SAFE_FILE_NAME_PATTERN.test(result.fileName)
  ) {
    throw new Error('Invalid diary export file');
  }

  const file = new File(result.fileUri);

  if (!file.exists || file.size <= 0) {
    throw new Error('Diary export file is unavailable');
  }
};

const getAndroidShareUri = (result: DiaryExportFileTarget): string => {
  const sourceFile = new File(result.fileUri);

  const shareDirectory = new Directory(Paths.cache, SHARE_CACHE_DIRECTORY_NAME);

  shareDirectory.create({
    idempotent: true,
    intermediates: true,
  });

  const shareFile = new File(shareDirectory, result.fileName);

  if (shareFile.exists) {
    shareFile.delete();
  }

  sourceFile.copy(shareFile);

  if (!shareFile.exists || shareFile.size <= 0) {
    throw new Error('Failed to prepare diary export for sharing');
  }

  return shareFile.uri;
};

const saveDiaryExportFileOnAndroid = async (
  result: DiaryExportFileTarget
): Promise<void> => {
  const FileSystem = await import('expo-file-system/legacy');

  const { default: ReactNativeBlobUtil } =
    await import('react-native-blob-util');

  const permission =
    await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

  if (!permission.granted) {
    return;
  }

  const targetUri = await FileSystem.StorageAccessFramework.createFileAsync(
    permission.directoryUri,
    result.fileName,
    getMimeType(result.fileName)
  );

  try {
    await ReactNativeBlobUtil.MediaCollection.writeToMediafile(
      targetUri,
      getLocalFilePath(result.fileUri)
    );

    const targetInfo = await FileSystem.getInfoAsync(targetUri);

    if (
      !targetInfo.exists ||
      typeof targetInfo.size !== 'number' ||
      targetInfo.size !== result.fileSize
    ) {
      throw new Error('Saved diary export file is incomplete');
    }
  } catch (error) {
    await FileSystem.deleteAsync(targetUri, {
      idempotent: true,
    }).catch(() => undefined);

    throw error;
  }
};

const saveDiaryExportFileOnIos = async (
  result: DiaryExportFileTarget
): Promise<void> => {
  const { default: Share } = await import('react-native-share');

  await Share.open({
    url: result.fileUri,
    type: getMimeType(result.fileName),
    filename: result.fileName,
    title: result.fileName,
    saveToFiles: true,
    failOnCancel: false,
  });
};

export const saveDiaryExportFile = async (
  result: DiaryExportFileTarget
): Promise<void> => {
  if (PlatformOS.WEB) {
    throw new Error('Diary export saving is unavailable on this platform');
  }

  assertExportFile(result);

  if (PlatformOS.ANDROID) {
    await saveDiaryExportFileOnAndroid(result);

    return;
  }

  await saveDiaryExportFileOnIos(result);
};

export const shareDiaryExportFile = async (
  result: DiaryExportFileTarget
): Promise<void> => {
  if (PlatformOS.WEB) {
    throw new Error('Diary export sharing is unavailable on this platform');
  }

  assertExportFile(result);

  const shareUri = PlatformOS.ANDROID
    ? getAndroidShareUri(result)
    : result.fileUri;

  const { default: Share } = await import('react-native-share');

  await Share.open({
    url: shareUri,
    type: getMimeType(result.fileName),
    filename: result.fileName,
    title: result.fileName,
    failOnCancel: false,
    useInternalStorage: PlatformOS.ANDROID,
  });
};
