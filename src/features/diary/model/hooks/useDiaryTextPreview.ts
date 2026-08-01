import { useCallback, useState } from 'react';
import {
  type GestureResponderEvent,
  type NativeSyntheticEvent,
  type TextLayoutEventData,
} from 'react-native';

const PREVIEW_LINE_COUNT = 4;

type UseDiaryTextPreviewParams = {
  text: string;
  onOpen: () => void;
};

type TextMeasurement = {
  text: string;
  lineCount: number;
};

const useDiaryTextPreview = ({ text, onOpen }: UseDiaryTextPreviewParams) => {
  const [measurement, setMeasurement] = useState<TextMeasurement>({
    text,
    lineCount: 0,
  });

  const isTruncated =
    measurement.text === text && measurement.lineCount > PREVIEW_LINE_COUNT;

  const handleTextLayout = useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<TextLayoutEventData>) => {
      const lineCount = nativeEvent.lines.length;

      setMeasurement((currentMeasurement) => {
        if (
          currentMeasurement.text === text &&
          currentMeasurement.lineCount === lineCount
        ) {
          return currentMeasurement;
        }

        return {
          text,
          lineCount,
        };
      });
    },
    [text]
  );

  const handleOpen = useCallback(
    (event: GestureResponderEvent) => {
      event.stopPropagation();
      onOpen();
    },
    [onOpen]
  );

  return {
    previewLineCount: PREVIEW_LINE_COUNT,
    isTruncated,
    handleTextLayout,
    handleOpen,
  };
};

export default useDiaryTextPreview;
