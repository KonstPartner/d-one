import { type StyleProp, type ViewStyle } from 'react-native';
import { css } from '@emotion/native';
import { Theme } from '@emotion/react';

import * as globalStyles from '@features/shared/styles/global';
import { toPX } from '@features/theme/model';

export const Root = css`
  flex: 1;
  justify-content: flex-end;
` as StyleProp<ViewStyle>;

export const Backdrop = css`
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.52);
` as StyleProp<ViewStyle>;

export const Sheet = (theme: Theme) =>
  css`
    width: 100%;
    max-width: 500px;
    max-height: 93%;
    align-self: center;
    overflow: hidden;
    background-color: ${theme.colors.bg};
    border-top-left-radius: ${toPX(theme.radius.xl)};
    border-top-right-radius: ${toPX(theme.radius.xl)};
  ` as StyleProp<ViewStyle>;

export const Header = (theme: Theme) =>
  [
    globalStyles.Row(theme, 'center', 'space-between', 'md'),
    globalStyles.InsetX(theme, 'md'),
    css`
      min-height: 58px;
      background-color: ${theme.colors.card};
      border-bottom-width: ${toPX(theme.border.width.sm)};
      border-bottom-color: ${theme.colors.border};
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const Body = css`
  flex-shrink: 1;
  min-height: 0;
` as StyleProp<ViewStyle>;

export const BodyContent = (theme: Theme) =>
  [
    globalStyles.Inset(theme, 'md'),
    css`
      padding-bottom: ${toPX(theme.spacing.xl)};
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const Footer = (theme: Theme) =>
  [
    globalStyles.Inset(theme, 'md'),
    css`
      background-color: ${theme.colors.card};
      border-top-width: ${toPX(theme.border.width.sm)};
      border-top-color: ${theme.colors.border};
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const Pressed = css`
  opacity: 0.7;
` as StyleProp<ViewStyle>;
