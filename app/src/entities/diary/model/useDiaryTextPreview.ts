import { useCallback, useState } from 'react';
import {
  type NativeSyntheticEvent,
  Platform,
  type TextLayoutEventData,
} from 'react-native';

type UseDiaryTextPreviewParams = {
  onOpen: () => void;
};

const PREVIEW_LINE_COUNT = 2;

export const useDiaryTextPreview = ({ onOpen }: UseDiaryTextPreviewParams) => {
  const [measuredLineCount, setMeasuredLineCount] = useState(0);

  const isTruncated = measuredLineCount > PREVIEW_LINE_COUNT;

  const canOpen = Platform.OS === 'web' || isTruncated;

  const handleTextLayout = useCallback(
    (event: NativeSyntheticEvent<TextLayoutEventData>) => {
      setMeasuredLineCount(event.nativeEvent.lines.length);
    },
    []
  );

  const handleOpen = useCallback(() => {
    if (canOpen) {
      onOpen();
    }
  }, [canOpen, onOpen]);

  return {
    previewLineCount: PREVIEW_LINE_COUNT,
    isTruncated,
    canOpen,
    handleTextLayout,
    handleOpen,
  };
};
