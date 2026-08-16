import { useCallback, useEffect, useState } from 'react';
import { Modal } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';

import { PlatformOS } from '@shared/lib/platform';

import { PhotoRedactorContent } from './PhotoRedactorContent';
import {
  type PhotoRedactorResult,
  type PhotoRedactorSource,
  usePhotoRedactor,
} from './usePhotoRedactor';

type PhotoRedactorModalProps = {
  visible: boolean;

  source: PhotoRedactorSource | null;

  onCancel: () => void;

  onConfirm: (result: PhotoRedactorResult) => void | Promise<void>;

  onError?: (error: unknown) => void;
};

const lockOrientation = (
  orientationLock: ScreenOrientation.OrientationLock
): void => {
  void ScreenOrientation.lockAsync(orientationLock).catch((error) => {
    console.error('Failed to change photo redactor orientation', error);
  });
};

export const PhotoRedactorModal = ({
  visible,
  source,
  onCancel,
  onConfirm,
  onError,
}: PhotoRedactorModalProps) => {
  const [isSaving, setIsSaving] = useState(false);

  const redactor = usePhotoRedactor({
    visible,
    source,
  });

  const { canExport, hasMasks, exportImage } = redactor;

  useEffect(() => {
    if (PlatformOS.WEB) {
      return;
    }

    lockOrientation(
      visible
        ? ScreenOrientation.OrientationLock.DEFAULT
        : ScreenOrientation.OrientationLock.PORTRAIT_UP
    );

    return () => {
      if (visible) {
        lockOrientation(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      }
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      setIsSaving(false);
    }
  }, [visible]);

  const handleCancel = useCallback((): void => {
    if (isSaving) {
      return;
    }

    onCancel();
  }, [isSaving, onCancel]);

  const handleConfirm = useCallback(async (): Promise<void> => {
    if (source === null || !canExport || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      if (!hasMasks) {
        await onConfirm({
          uri: source.uri,
          edited: false,
        });

        return;
      }

      const exportedPhoto = await exportImage();

      try {
        await onConfirm({
          uri: exportedPhoto.uri,
          edited: true,
        });
      } finally {
        exportedPhoto.cleanup();
      }
    } catch (error) {
      if (onError !== undefined) {
        onError(error);
      } else {
        console.error('Failed to redact photo', error);
      }
    } finally {
      setIsSaving(false);
    }
  }, [canExport, exportImage, hasMasks, isSaving, onConfirm, onError, source]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      statusBarTranslucent
      navigationBarTranslucent
      hardwareAccelerated
      supportedOrientations={[
        'portrait',
        'portrait-upside-down',
        'landscape',
        'landscape-left',
        'landscape-right',
      ]}
      onRequestClose={handleCancel}
    >
      <PhotoRedactorContent
        source={source}
        isSaving={isSaving}
        redactor={redactor}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </Modal>
  );
};
