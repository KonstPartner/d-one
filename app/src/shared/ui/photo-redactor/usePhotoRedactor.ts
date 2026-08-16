import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  type LayoutChangeEvent,
  PanResponder,
  type ViewStyle,
} from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';
import type Svg from 'react-native-svg';

export type PhotoRedactorSource = {
  uri: string;
  width: number;
  height: number;
};

export type PhotoRedactorResult = {
  uri: string;
  edited: boolean;
};

export type PhotoRedactorMask = {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

type Size = {
  width: number;
  height: number;
};

type Point = {
  x: number;
  y: number;
};

type ExportedPhoto = {
  uri: string;
  cleanup: () => void;
};

type UsePhotoRedactorParams = {
  visible: boolean;
  source: PhotoRedactorSource | null;
};

const MINIMUM_MASK_SIZE = 4;

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(Math.max(value, minimum), maximum);

const getCanvasSize = (viewport: Size, source: PhotoRedactorSource): Size => {
  const ratio = Math.min(
    viewport.width / source.width,
    viewport.height / source.height
  );

  return {
    width: source.width * ratio,
    height: source.height * ratio,
  };
};

const createMask = ({
  start,
  end,
  canvas,
  source,
}: {
  start: Point;
  end: Point;
  canvas: Size;
  source: PhotoRedactorSource;
}): Omit<PhotoRedactorMask, 'id'> => {
  const left = Math.min(start.x, end.x);
  const top = Math.min(start.y, end.y);

  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);

  const scaleX = source.width / canvas.width;
  const scaleY = source.height / canvas.height;

  return {
    x: left * scaleX,
    y: top * scaleY,
    width: width * scaleX,
    height: height * scaleY,
  };
};

const deleteFileSafely = (file: File): void => {
  try {
    if (file.exists) {
      file.delete();
    }
  } catch {
    return;
  }
};

const stripDataUrlPrefix = (value: string): string =>
  value.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '');

export const usePhotoRedactor = ({
  visible,
  source,
}: UsePhotoRedactorParams) => {
  const svgRef = useRef<Svg | null>(null);

  const nextMaskIdRef = useRef(1);

  const startPointRef = useRef<Point | null>(null);

  const [viewportSize, setViewportSize] = useState<Size | null>(null);

  const [masks, setMasks] = useState<PhotoRedactorMask[]>([]);

  const [drawingMask, setDrawingMask] = useState<Omit<
    PhotoRedactorMask,
    'id'
  > | null>(null);

  const [imageReady, setImageReady] = useState(false);

  const canvasSize = useMemo(() => {
    if (viewportSize === null || source === null) {
      return null;
    }

    return getCanvasSize(viewportSize, source);
  }, [source, viewportSize]);

  const canvasStyle = useMemo<ViewStyle | undefined>(
    () =>
      canvasSize === null
        ? undefined
        : {
            width: canvasSize.width,
            height: canvasSize.height,
          },
    [canvasSize]
  );

  useEffect(() => {
    if (!visible) {
      return;
    }

    nextMaskIdRef.current = 1;
    startPointRef.current = null;

    setMasks([]);
    setDrawingMask(null);
    setImageReady(false);
  }, [source?.uri, visible]);

  const handleViewportLayout = useCallback((event: LayoutChangeEvent): void => {
    const { width, height } = event.nativeEvent.layout;

    setViewportSize((currentSize) => {
      if (currentSize?.width === width && currentSize.height === height) {
        return currentSize;
      }

      return {
        width,
        height,
      };
    });
  }, []);

  const handleImageLoad = useCallback((): void => {
    setImageReady(true);
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () =>
          source !== null && canvasSize !== null,

        onMoveShouldSetPanResponder: () =>
          source !== null && canvasSize !== null,

        onPanResponderGrant: (event) => {
          if (source === null || canvasSize === null) {
            return;
          }

          const start = {
            x: clamp(event.nativeEvent.locationX, 0, canvasSize.width),
            y: clamp(event.nativeEvent.locationY, 0, canvasSize.height),
          };

          startPointRef.current = start;

          setDrawingMask(
            createMask({
              start,
              end: start,
              canvas: canvasSize,
              source,
            })
          );
        },

        onPanResponderMove: (_event, gestureState) => {
          if (
            source === null ||
            canvasSize === null ||
            startPointRef.current === null
          ) {
            return;
          }

          const start = startPointRef.current;

          const end = {
            x: clamp(start.x + gestureState.dx, 0, canvasSize.width),
            y: clamp(start.y + gestureState.dy, 0, canvasSize.height),
          };

          setDrawingMask(
            createMask({
              start,
              end,
              canvas: canvasSize,
              source,
            })
          );
        },

        onPanResponderRelease: (_event, gestureState) => {
          if (
            source === null ||
            canvasSize === null ||
            startPointRef.current === null
          ) {
            startPointRef.current = null;
            setDrawingMask(null);

            return;
          }

          const start = startPointRef.current;

          const end = {
            x: clamp(start.x + gestureState.dx, 0, canvasSize.width),
            y: clamp(start.y + gestureState.dy, 0, canvasSize.height),
          };

          const displayWidth = Math.abs(end.x - start.x);
          const displayHeight = Math.abs(end.y - start.y);

          if (
            displayWidth >= MINIMUM_MASK_SIZE &&
            displayHeight >= MINIMUM_MASK_SIZE
          ) {
            const mask = createMask({
              start,
              end,
              canvas: canvasSize,
              source,
            });

            setMasks((currentMasks) => [
              ...currentMasks,
              {
                id: nextMaskIdRef.current++,
                ...mask,
              },
            ]);
          }

          startPointRef.current = null;

          setDrawingMask(null);
        },

        onPanResponderTerminate: () => {
          startPointRef.current = null;

          setDrawingMask(null);
        },

        onPanResponderTerminationRequest: () => false,

        onShouldBlockNativeResponder: () => true,
      }),
    [canvasSize, source]
  );

  const undo = useCallback((): void => {
    setMasks((currentMasks) =>
      currentMasks.length === 0 ? currentMasks : currentMasks.slice(0, -1)
    );
  }, []);

  const exportImage = useCallback(async (): Promise<ExportedPhoto> => {
    if (source === null || svgRef.current === null || !imageReady) {
      throw new Error('Photo redactor is not ready');
    }

    const svg = svgRef.current;

    const base64 = await new Promise<string>((resolve, reject) => {
      try {
        svg.toDataURL(resolve, {
          width: source.width,
          height: source.height,
        });
      } catch (error) {
        reject(error);
      }
    });

    const outputFile = new File(
      Paths.cache,
      `photo-redactor-${Date.now()}-${Math.random().toString(36).slice(2)}.png`
    );

    try {
      await FileSystem.writeAsStringAsync(
        outputFile.uri,
        stripDataUrlPrefix(base64),
        {
          encoding: FileSystem.EncodingType.Base64,
        }
      );

      if (!outputFile.exists || outputFile.size <= 0) {
        throw new Error('Failed to create edited photo');
      }

      return {
        uri: outputFile.uri,
        cleanup: () => {
          deleteFileSafely(outputFile);
        },
      };
    } catch (error) {
      deleteFileSafely(outputFile);

      throw error;
    }
  }, [imageReady, source]);

  return {
    svgRef,

    masks,
    drawingMask,

    canvasSize,
    canvasStyle,

    imageReady,

    hasMasks: masks.length > 0,
    canUndo: masks.length > 0,
    canExport: source !== null && canvasSize !== null && imageReady,

    panHandlers: panResponder.panHandlers,

    handleViewportLayout,
    handleImageLoad,

    undo,
    exportImage,
  };
};
