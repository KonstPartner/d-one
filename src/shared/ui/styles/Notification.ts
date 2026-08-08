import { css } from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import * as sharedStyles from '@shared/styles';

export const ManagerContainer = (theme: Theme): StyleProp<ViewStyle> =>
  sharedStyles.InsetX(theme, 'sm');

export const AnimatedWrap: StyleProp<ViewStyle> = [
  sharedStyles.FullWidth,
  css`
    max-width: 500px;
  `,
];

export const ToastWrapper: StyleProp<ViewStyle> = sharedStyles.FullWidth;

export const Container = (theme: Theme): StyleProp<ViewStyle> => [
  sharedStyles.Surface(theme, 'background'),
  sharedStyles.Rounded(theme, 'md'),
  css`
    width: 100%;

    align-self: stretch;

    flex-direction: row;
    align-items: stretch;

    overflow: hidden;
  `,
];

export const Stripe = (
  theme: Theme,
  accent: string
): StyleProp<ViewStyle> => css`
  width: ${theme.spacing.sm}px;

  background-color: ${accent};
`;

export const Content = (theme: Theme): StyleProp<ViewStyle> => [
  sharedStyles.Inset(theme, 'md'),
  css`
    flex: 1;
  `,
];

export const HeaderRow = (theme: Theme): StyleProp<ViewStyle> =>
  sharedStyles.Row(theme, 'center', 'space-between', 'sm');

export const TitleRow = (theme: Theme): StyleProp<ViewStyle> => [
  sharedStyles.Row(theme, 'center', 'flex-start', 'sm'),
  sharedStyles.FlexItem,
];

export const Title = (theme: Theme): StyleProp<TextStyle> => [
  sharedStyles.Text(theme, 'md', 'heavy', 'default', 'md'),
  css`
    flex: 1;
    min-width: 0px;
  `,
];

export const Message = (theme: Theme): StyleProp<TextStyle> => [
  sharedStyles.Body(theme),
  css`
    margin-top: ${theme.spacing.sm}px;
  `,
];

export const CloseButton: StyleProp<ViewStyle> = sharedStyles.CenterContent;

export const ProgressTrack = (theme: Theme): StyleProp<ViewStyle> => [
  sharedStyles.FullWidth,
  sharedStyles.Rounded(theme, 'full'),
  css`
    height: ${theme.spacing.xs}px;

    margin-top: ${theme.spacing.md}px;

    background-color: ${theme.colors.card};

    overflow: hidden;
  `,
];

export const ProgressFill = (
  theme: Theme,
  accent: string
): StyleProp<ViewStyle> => [
  sharedStyles.Rounded(theme, 'full'),
  css`
    height: ${theme.spacing.xs}px;

    background-color: ${accent};
  `,
];
