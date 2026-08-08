import { css } from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import * as ss from '@shared/styles';

export const ManagerContainer = (theme: Theme): StyleProp<ViewStyle> =>
  ss.InsetX(theme, 'sm');

export const AnimatedWrap: StyleProp<ViewStyle> = [
  ss.FullWidth,
  css`
    max-width: 500px;
  ` as ViewStyle,
];

export const ToastWrapper: StyleProp<ViewStyle> = ss.FullWidth;

export const Container = (theme: Theme): StyleProp<ViewStyle> => [
  ss.Surface(theme, 'background'),
  ss.Rounded(theme, 'md'),

  css`
    width: 100%;

    align-self: stretch;

    flex-direction: row;
    align-items: stretch;

    overflow: hidden;
  ` as ViewStyle,
];

export const Stripe = (theme: Theme, accent: string): StyleProp<ViewStyle> =>
  css`
    width: ${ss.px(theme.spacing.sm)};

    background-color: ${accent};
  ` as ViewStyle;

export const Content = (theme: Theme): StyleProp<ViewStyle> => [
  ss.Inset(theme, 'md'),

  css`
    flex: 1;
  ` as ViewStyle,
];

export const HeaderRow = (theme: Theme): StyleProp<ViewStyle> =>
  ss.Row(theme, 'center', 'space-between', 'sm');

export const TitleRow = (theme: Theme): StyleProp<ViewStyle> => [
  ss.FlexItem,
  ss.Row(theme, 'center', 'flex-start', 'sm'),
];

export const Title = (theme: Theme): StyleProp<TextStyle> => [
  ss.Text(theme, 'md', 'heavy', 'default', 'md'),

  css`
    flex: 1;
    min-width: 0px;
  ` as TextStyle,
];

export const Message = (theme: Theme): StyleProp<TextStyle> => [
  ss.Body(theme),

  css`
    margin-top: ${ss.px(theme.spacing.sm)};
  ` as TextStyle,
];

export const CloseButton: StyleProp<ViewStyle> = ss.CenterContent;

export const ProgressTrack = (theme: Theme): StyleProp<ViewStyle> => [
  ss.FullWidth,
  ss.Rounded(theme, 'full'),

  css`
    height: ${ss.px(theme.spacing.xs)};

    margin-top: ${ss.px(theme.spacing.md)};

    background-color: ${theme.colors.card};

    overflow: hidden;
  ` as ViewStyle,
];

export const ProgressFill = (
  theme: Theme,
  accent: string
): StyleProp<ViewStyle> => [
  ss.Rounded(theme, 'full'),

  css`
    height: ${ss.px(theme.spacing.xs)};

    background-color: ${accent};
  ` as ViewStyle,
];
