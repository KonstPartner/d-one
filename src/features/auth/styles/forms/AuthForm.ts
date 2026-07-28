import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { css } from '@emotion/native';
import { Theme } from '@emotion/react';

import * as globalStyles from '@features/shared/styles/global';
import { toPX } from '@features/theme/model';

type ButtonStyle = StyleProp<ViewStyle> & StyleProp<TextStyle>;

export const Form = (theme: Theme) => globalStyles.StackContainer(theme, 'lg');

export const Input = (theme: Theme) =>
  css`
    min-height: 48px;
    border-radius: ${toPX(theme.radius.md)};
  ` as any;

export const SubmitButton = (theme: Theme, disabled: boolean) =>
  [
    globalStyles.ButtonStyles(theme, disabled),
    css`
      min-height: 48px;
      border-radius: ${toPX(theme.radius.md)};
      margin-top: ${toPX(theme.spacing.xs)};
      color: ${theme.colors.white};
    ` as ButtonStyle,
  ] as ButtonStyle;

export const SubmitButtonText = (theme: Theme) =>
  globalStyles.ButtonText(theme);

export const SwitchFormRow = (theme: Theme) =>
  globalStyles.Row(theme, 'center', 'center', 'xs');

export const SwitchFormText = (theme: Theme) =>
  css`
    color: ${theme.colors.muted};
    font-size: ${toPX(theme.size.base)};
    font-weight: ${theme.weight.regular};
    line-height: ${toPX(theme.lineHeight.md)};
  ` as StyleProp<TextStyle>;

export const SwitchFormLink = (theme: Theme) =>
  css`
    color: ${theme.colors.primary};
    font-size: ${toPX(theme.size.base)};
    font-weight: ${theme.weight.bold};
    line-height: ${toPX(theme.lineHeight.md)};
  ` as StyleProp<TextStyle>;
