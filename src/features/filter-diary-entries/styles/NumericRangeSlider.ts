import styled from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { TextStyle, ViewStyle } from 'react-native';

import * as ss from '@shared/styles';

type ColorProps = {
  $color: string;
};

type NullSlotProps = ColorProps & {
  $boundary: 'min' | 'max';
};

export const Track = styled.View`
  position: relative;

  height: ${ss.px(22)};

  margin-top: ${({ theme }) => ss.px(theme.spacing.md)};

  margin-horizontal: ${({ theme }) => ss.px(theme.spacing.md)};
`;

export const Rail = styled.View<ColorProps>`
  position: absolute;

  top: ${ss.px(7)};
  bottom: ${ss.px(7)};

  left: 14%;
  right: 14%;

  border-radius: ${({ theme }) => ss.px(theme.radius.full)};

  background-color: ${({ $color }) => $color};

  opacity: ${({ theme }) => (theme.mode === 'dark' ? 0.32 : 0.24)};
`;

export const NullSlot = styled.View<NullSlotProps>`
  position: absolute;

  top: ${ss.px(3)};

  ${({ $boundary }) =>
    $boundary === 'min'
      ? `
          left: 0;
          margin-left: -8px;
        `
      : `
          right: 0;
          margin-right: -8px;
        `}

  width: ${ss.px(16)};
  height: ${ss.px(16)};

  border-width: ${ss.px(2)};

  border-color: ${({ $color }) => $color};

  border-radius: ${({ theme }) => ss.px(theme.radius.full)};

  background-color: ${({ theme }) => theme.colors.card};

  opacity: ${({ theme }) => (theme.mode === 'dark' ? 0.72 : 0.56)};
`;

export const getFillStyle = (theme: Theme, color: string): ViewStyle => ({
  position: 'absolute',

  top: 7,
  bottom: 7,

  borderRadius: theme.radius.full,

  backgroundColor: color,
});

export const getThumbStyle = (theme: Theme, color: string): ViewStyle => ({
  position: 'absolute',

  top: 0,

  width: 22,
  height: 22,

  marginLeft: -11,

  borderWidth: 3,

  borderColor: theme.colors.card,

  borderRadius: theme.radius.full,

  backgroundColor: color,

  shadowColor: theme.colors.black,

  shadowOpacity: theme.mode === 'dark' ? 0.35 : 0.18,

  shadowRadius: 5,

  elevation: 2,
});

export const getValueBubbleStyle = (
  theme: Theme,
  color: string
): ViewStyle => ({
  position: 'absolute',

  top: -34,

  minWidth: 34,
  height: 26,

  marginLeft: -17,

  alignItems: 'center',

  justifyContent: 'center',

  paddingHorizontal: theme.spacing.xs,

  borderRadius: theme.radius.md,

  backgroundColor: color,

  shadowColor: theme.colors.black,

  shadowOpacity: theme.mode === 'dark' ? 0.34 : 0.16,

  shadowRadius: 4,

  elevation: 2,
});

export const ValueBubbleText = styled.Text`
  ${({ theme }) => ss.Caption(theme)};

  color: ${({ theme }) => theme.colors.white};

  font-weight: ${({ theme }) => theme.weight.bold};

  text-align: center;
`;

export const Scale = styled.View`
  position: relative;

  height: ${({ theme }) => ss.px(theme.size.md)};

  margin-top: ${({ theme }) => ss.px(theme.spacing.md)};

  margin-bottom: ${({ theme }) => ss.px(theme.spacing.sm)};

  margin-horizontal: ${({ theme }) => ss.px(theme.spacing.md)};
`;

export const ScaleText = styled.Text`
  ${({ theme }) => ss.Caption(theme)};

  position: absolute;

  color: ${({ theme }) => theme.colors.muted};
`;

export const getScaleTextPosition = (position: number): TextStyle => {
  if (position === 0) {
    return {
      left: 0,
    };
  }

  if (position === 100) {
    return {
      right: 0,
    };
  }

  return {
    left: `${position}%` as `${number}%`,

    width: 32,

    marginLeft: -16,

    textAlign: 'center',
  };
};
