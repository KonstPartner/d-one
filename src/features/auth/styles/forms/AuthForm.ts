import { ImageStyle, StyleProp, TextStyle, ViewStyle } from 'react-native';
import { css } from '@emotion/native';
import { Theme } from '@emotion/react';

import * as globalStyles from '@features/shared/styles/global';
import { toPX } from '@features/theme/model';

type ButtonStyle = StyleProp<ViewStyle> & StyleProp<TextStyle>;

export const AuthContent = (theme: Theme) =>
  css`
    width: 100%;
    max-width: 420px;
    align-self: center;
    gap: ${toPX(theme.spacing.lg)};
  ` as StyleProp<ViewStyle>;

export const Brand = (theme: Theme) =>
  css`
    align-items: center;
    justify-content: center;
    gap: ${toPX(theme.spacing.sm)};
    margin-bottom: ${toPX(theme.spacing.sm)};
  ` as StyleProp<ViewStyle>;

export const Logo = css`
  width: 64px;
  height: 64px;
  border-radius: 21px;
` as StyleProp<ImageStyle>;

export const BrandName = (theme: Theme) =>
  css`
    color: ${theme.colors.text};
    font-size: 20px;
    font-weight: 900;
    line-height: 25px;
    text-align: center;
  ` as StyleProp<TextStyle>;

export const ScreenTitle = (theme: Theme) =>
  css`
    color: ${theme.colors.text};
    font-size: 26px;
    font-weight: 700;
    line-height: 32px;
  ` as StyleProp<TextStyle>;

export const Form = (theme: Theme) => globalStyles.StackContainer(theme, 'md');

export const Input = (theme: Theme) =>
  css`
    min-height: 48px;
    border-radius: ${toPX(theme.radius.md)};
  ` as StyleProp<TextStyle>;

export const ForgotPasswordRow = css`
  width: 100%;
  align-items: flex-end;
  margin-top: -6px;
` as StyleProp<ViewStyle>;

export const SubmitButton = (theme: Theme, disabled: boolean) =>
  [
    globalStyles.ButtonStyles(theme, disabled),
    css`
      min-height: 48px;
      border-radius: ${toPX(theme.radius.md)};
      color: ${theme.colors.white};
    ` as ButtonStyle,
  ] as ButtonStyle;

export const SubmitButtonText = (theme: Theme) =>
  globalStyles.ButtonText(theme);

export const Divider = (theme: Theme) =>
  css`
    width: 100%;
    flex-direction: row;
    align-items: center;
    gap: ${toPX(theme.spacing.sm)};
  ` as StyleProp<ViewStyle>;

export const DividerLine = (theme: Theme) =>
  css`
    flex: 1;
    height: 1px;
    background-color: ${theme.colors.border};
  ` as StyleProp<ViewStyle>;

export const DividerText = (theme: Theme) =>
  css`
    color: ${theme.colors.muted};
    font-size: 13px;
    font-weight: 500;
    line-height: 18px;
  ` as StyleProp<TextStyle>;

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
