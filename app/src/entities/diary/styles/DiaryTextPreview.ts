import styled from '@emotion/native';

import * as ss from '@shared/styles';

import type { DiaryTextPreviewVariant } from '../ui/DiaryTextPreview';

type VariantProps = {
  $variant: DiaryTextPreviewVariant;
};

export const Root = styled.Pressable<VariantProps>`
  width: 100%;

  min-height: ${({ theme }) => ss.px(theme.control.height.lg)};

  flex-direction: row;
  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.md)};

  padding: ${({ theme }) => ss.px(theme.spacing.md)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => ss.px(theme.radius.md)};
`;

export const Icon = styled.View<VariantProps>`
  width: 38px;
  height: 38px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme, $variant }) =>
    $variant === 'aiAnalysis'
      ? theme.colors.metrics.longInsulin.background
      : theme.colors.shades.primary.sm};
`;

export const Content = styled.View`
  flex: 1;

  min-width: 0;

  gap: ${({ theme }) => ss.px(theme.spacing.xs)};
`;

export const Title = styled.Text`
  color: ${({ theme }) => theme.colors.muted};

  font-size: ${({ theme }) => ss.px(theme.size.xs)};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.xs)};

  font-weight: ${({ theme }) => theme.weight.heavy};

  letter-spacing: 1.1px;

  text-transform: uppercase;
`;

export const TextFrame = styled.View`
  position: relative;
`;

export const PreviewText = styled.Text`
  ${({ theme }) => ss.Body(theme)};
`;

export const Measurement = styled.View`
  position: absolute;

  top: 0;
  right: 0;
  left: 0;

  opacity: 0;
`;

export const MeasurementText = styled.Text`
  ${({ theme }) => ss.Body(theme)};
`;
