import { ImageStyle, StyleProp, TextStyle, ViewStyle } from 'react-native';
import { css } from '@emotion/native';
import { Theme } from '@emotion/react';

import * as globalStyles from '@features/shared/styles/global';
import { toPX } from '@features/theme/model';

export const Scroll = css`
  flex: 1;
` as StyleProp<ViewStyle>;

export const ScrollContent = (theme: Theme) =>
  css`
    flex-grow: 1;
    justify-content: center;
    padding-top: ${toPX(theme.spacing.xl)};
    padding-bottom: ${toPX(theme.spacing.xl)};
  ` as StyleProp<ViewStyle>;

export const Container = (theme: Theme) =>
  [
    globalStyles.StackContainer(theme, 'xl'),
    css`
      width: 100%;
      max-width: 420px;
      align-self: center;
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const Brand = (theme: Theme) =>
  [
    globalStyles.CenterContent,
    globalStyles.StackContainer(theme, 'sm'),
  ] as StyleProp<ViewStyle>;

export const Logo = css`
  width: 72px;
  height: 72px;
  border-radius: 20px;
` as StyleProp<ImageStyle>;

export const BrandName = (theme: Theme) =>
  css`
    color: ${theme.colors.text};
    font-size: ${toPX(theme.size.lg)};
    font-weight: ${theme.weight.bold};
    line-height: ${toPX(theme.lineHeight.xl)};
    text-align: center;
  ` as StyleProp<TextStyle>;

export const Title = (theme: Theme) =>
  css`
    color: ${theme.colors.text};
    font-size: ${toPX(theme.size.xl)};
    font-weight: ${theme.weight.bold};
    line-height: ${toPX(theme.lineHeight['2xl'])};
    text-align: center;
  ` as StyleProp<TextStyle>;
