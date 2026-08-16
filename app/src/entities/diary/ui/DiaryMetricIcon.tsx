import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import type { ComponentProps } from 'react';

export type DiaryMetricKey =
  | 'glucose'
  | 'carbsGram'
  | 'shortInsulin'
  | 'longInsulin';

type DiaryMetricIconProps = {
  metric: DiaryMetricKey;
  size: number;
  color: string;
};

const IONICON_NAMES: Record<
  Exclude<DiaryMetricKey, 'shortInsulin' | 'longInsulin'>,
  ComponentProps<typeof Ionicons>['name']
> = {
  glucose: 'water',
  carbsGram: 'leaf-outline',
};

export const DiaryMetricIcon = ({
  metric,
  size,
  color,
}: DiaryMetricIconProps) => {
  if (metric === 'shortInsulin') {
    return <MaterialCommunityIcons name="needle" size={size} color={color} />;
  }

  if (metric === 'longInsulin') {
    return <MaterialIcons name="speed" size={size} color={color} />;
  }

  return <Ionicons name={IONICON_NAMES[metric]} size={size} color={color} />;
};
