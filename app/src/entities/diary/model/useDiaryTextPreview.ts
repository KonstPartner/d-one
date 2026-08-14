import { useCallback, useState } from 'react';
import type { NativeSyntheticEvent, TextLayoutEventData } from 'react-native';

type UseDiaryTextPreviewParams = {
  onOpen: () => void;
};

const PREVIEW_LINE_COUNT = 2;

export const useDiaryTextPreview = ({ onOpen }: UseDiaryTextPreviewParams) => {
  const [measuredLineCount, setMeasuredLineCount] = useState(0);

  const isTruncated = measuredLineCount > PREVIEW_LINE_COUNT;

  const handleTextLayout = useCallback(
    (event: NativeSyntheticEvent<TextLayoutEventData>) => {
      setMeasuredLineCount(event.nativeEvent.lines.length);
    },
    []
  );

  const handleOpen = useCallback(() => {
    if (isTruncated) {
      onOpen();
    }
  }, [isTruncated, onOpen]);

  return {
    previewLineCount: PREVIEW_LINE_COUNT,
    isTruncated,
    handleTextLayout,
    handleOpen,
  };
};
