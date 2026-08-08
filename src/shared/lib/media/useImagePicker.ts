import { useCallback, useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

import { i18n } from '@features/i18n/model';

import { showNotification } from '../../ui/Notification';
import { PlatformOS } from '../constants/platformOS';
import { errorMapper } from '../utils/error';

type PickRoundOptions = {
  size?: number;
  quality?: number;
};

const ROUND_DEFAULTS: Required<PickRoundOptions> = {
  size: 512,
  quality: 0.9,
};

type PickRectangularImageOptions = {
  aspect?: [number, number];
  quality?: number;
};

const RECTANGULAR_DEFAULTS: Required<PickRectangularImageOptions> = {
  aspect: [4, 3],
  quality: 0.85,
};

type ImageCropMode = 'none' | 'square' | 'round' | 'rectangular';
type ImagePickerSource = 'camera' | 'library';

type PickImageOptions = {
  crop?: ImageCropMode;
  aspect?: [number, number];
  size?: number;
  quality?: number;
};

const IMAGE_DEFAULTS: Required<PickImageOptions> = {
  crop: 'none',
  aspect: [1, 1],
  size: 1200,
  quality: 1,
};

let CropPicker: any = null;

if (!PlatformOS.WEB) {
  try {
    CropPicker = require('react-native-image-crop-picker');
  } catch {
    CropPicker = null;
  }
}

const handleError = (error: unknown) => {
  const errorMessage = errorMapper(error, 'none');

  if (!String(errorMessage).includes('User cancelled image selection')) {
    showNotification('error', errorMessage);
  }

  return null;
};

const ensurePermission = async (
  source: ImagePickerSource
): Promise<boolean> => {
  const permissionResult =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permissionResult.granted) {
    const permissionKey =
      source === 'camera'
        ? 'common.permissions.camera.denied'
        : 'common.permissions.gallery.denied';

    showNotification('error', i18n.t(permissionKey));

    return false;
  }

  return true;
};

const normalizeImageUri = (uri: string): string => {
  if (
    uri.startsWith('file://') ||
    uri.startsWith('content://') ||
    uri.startsWith('http://') ||
    uri.startsWith('https://')
  ) {
    return uri;
  }

  return `file://${uri}`;
};

const useImagePicker = () => {
  const [isPicking, setIsPicking] = useState(false);
  const isPickingRef = useRef(false);

  const pickImageFromSource = useCallback(
    async (
      source: ImagePickerSource,
      options: PickImageOptions = {}
    ): Promise<string | null> => {
      const { crop, aspect, size, quality } = {
        ...IMAGE_DEFAULTS,
        ...options,
      };

      if (isPickingRef.current) {
        return null;
      }

      try {
        isPickingRef.current = true;
        setIsPicking(true);

        const hasPermission = await ensurePermission(source);

        if (!hasPermission) {
          return null;
        }

        const nativeMethod =
          source === 'camera' ? CropPicker?.openCamera : CropPicker?.openPicker;

        if (PlatformOS.WEB || !nativeMethod) {
          const pickerOptions: ImagePicker.ImagePickerOptions = {
            mediaTypes: ['images'],
            allowsMultipleSelection: false,
            allowsEditing: crop !== 'none',
            aspect,
            quality,
            selectionLimit: 1,
          };
          const result =
            source === 'camera'
              ? await ImagePicker.launchCameraAsync(pickerOptions)
              : await ImagePicker.launchImageLibraryAsync(pickerOptions);

          if (result.canceled || !result.assets?.length) {
            return null;
          }

          return result.assets[0].uri;
        }

        if (crop === 'none') {
          const image = await nativeMethod({
            mediaType: 'photo',
            cropping: false,
            compressImageQuality: quality,
            includeBase64: false,
          });

          return image?.path ? normalizeImageUri(image.path) : null;
        }

        if (crop === 'round') {
          const image = await nativeMethod({
            mediaType: 'photo',
            cropping: true,
            cropperCircleOverlay: true,
            width: size,
            height: size,
            compressImageQuality: quality,
            includeBase64: false,
          });

          return image?.path ? normalizeImageUri(image.path) : null;
        }

        const width = size;
        const height =
          crop === 'square'
            ? size
            : Math.round(width * (aspect[1] / aspect[0]));
        const image = await nativeMethod({
          mediaType: 'photo',
          cropping: true,
          cropperCircleOverlay: false,
          width,
          height,
          compressImageQuality: quality,
          includeBase64: false,
          forceJpg: true,
        });

        return image?.path ? normalizeImageUri(image.path) : null;
      } catch (error) {
        return handleError(error);
      } finally {
        isPickingRef.current = false;
        setIsPicking(false);
      }
    },
    []
  );

  const pickImage = useCallback(
    async (options: PickImageOptions = {}): Promise<string | null> =>
      pickImageFromSource('library', options),
    [pickImageFromSource]
  );

  const takeImage = useCallback(
    async (options: PickImageOptions = {}): Promise<string | null> =>
      pickImageFromSource('camera', options),
    [pickImageFromSource]
  );

  const pickRoundImage = useCallback(
    async (options: PickRoundOptions = {}): Promise<string | null> => {
      const { size, quality } = { ...ROUND_DEFAULTS, ...options };

      return pickImage({
        crop: 'round',
        size,
        quality,
      });
    },
    [pickImage]
  );

  const pickRectangularImage = useCallback(
    async (
      options: PickRectangularImageOptions = {}
    ): Promise<string | null> => {
      const { aspect, quality } = {
        ...RECTANGULAR_DEFAULTS,
        ...options,
      };

      return pickImage({
        crop: 'rectangular',
        aspect,
        quality,
      });
    },
    [pickImage]
  );

  const pickSquareImage = useCallback(
    async (options: PickRoundOptions = {}): Promise<string | null> => {
      const { size, quality } = { ...ROUND_DEFAULTS, ...options };

      return pickImage({
        crop: 'square',
        aspect: [1, 1],
        size,
        quality,
      });
    },
    [pickImage]
  );

  return {
    pickImage,
    takeImage,
    pickRoundImage,
    pickRectangularImage,
    pickSquareImage,
    isPicking,
  };
};

export default useImagePicker;
