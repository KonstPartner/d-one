import styled from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { TextStyle } from 'react-native';

import * as ss from '@shared/styles';

type DisabledProps = {
  $disabled: boolean;
};

type MetaIconProps = {
  $backgroundColor: string;
  $borderColor: string;
};

type InsulinMetricProps = {
  $width: number;
};

export const Root = styled.View`
  gap: ${({ theme }) => ss.px(theme.spacing.md)};
`;

export const MetricRows = styled.View`
  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const Metrics = styled.View`
  flex-direction: row;
  flex-wrap: wrap;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const InsulinScroll = styled.ScrollView``;

export const InsulinMetrics = styled.View`
  flex-direction: row;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const InsulinMetric = styled.View<InsulinMetricProps>`
  width: ${({ $width }) => ss.px($width)};
`;

export const MealPhotoRow = styled.View`
  flex-direction: row;

  align-items: stretch;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const MealRelationArea = styled.View`
  flex: 1;
  flex-basis: 0;

  min-width: 0;
`;

export const PhotoArea = styled.View`
  flex: 1;
  flex-basis: 0;

  min-width: 0;

  align-self: stretch;
`;

export const MetaIcon = styled.View<MetaIconProps>`
  width: ${ss.px(36)};
  height: ${ss.px(36)};

  align-items: center;
  justify-content: center;

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};

  border-color: ${({ $borderColor }) => $borderColor};

  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ $backgroundColor }) => $backgroundColor};
`;

export const CommentField = styled.View<DisabledProps>`
  min-width: 0;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};

  padding: ${({ theme }) => ss.px(theme.spacing.sm)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-color: ${({ theme }) => theme.colors.border};

  border-radius: ${({ theme }) => ss.px(theme.radius.lg)};

  background-color: ${({ theme }) => theme.colors.card};

  opacity: ${({ $disabled }) => ($disabled ? 0.55 : 1)};
`;

export const CommentHeader = styled.View`
  flex-direction: row;
  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const FieldLabel = styled.Text`
  flex: 1;

  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => ss.px(theme.size.sm)};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.md)};

  font-weight: ${({ theme }) => theme.weight.semibold};
`;

export const DeleteAiButtonContent = styled.View`
  flex-direction: row;
  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.xs)};
`;

export const DeleteAiButtonText = styled.Text`
  ${({ theme }) => ss.Text(theme, 'sm', 'semibold', 'danger', 'md')};
`;

export const AiAnalysisScroll = styled.ScrollView`
  padding: ${({ theme }) => ss.px(theme.spacing.md)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme }) => theme.colors.bg};
`;

export const AiAnalysisText = styled.Text`
  ${({ theme }) => ss.Text(theme, 'sm', 'regular', 'default', 'lg')};
`;

export const ToggleRow = styled.View`
  flex-direction: row;

  align-items: stretch;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const ToggleCell = styled.View`
  flex: 1;
  flex-basis: 0;

  min-width: 0;
`;

export const getCommentInputStyle = (theme: Theme): TextStyle => ({
  height: 64,
  minHeight: 64,

  backgroundColor: theme.colors.input,
});
