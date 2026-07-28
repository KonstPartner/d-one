import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { css } from '@emotion/native';
import { Theme } from '@emotion/react';

import * as globalStyles from '@features/shared/styles/global';
import { toPX } from '@features/theme/model';

type ActionStyle = StyleProp<ViewStyle> & StyleProp<TextStyle>;

export const Container = (theme: Theme) =>
  [
    globalStyles.StackContainer(theme, 'xl'),
    css`
      flex: 1;
      width: 100%;
      max-width: 420px;
      align-self: center;
      justify-content: center;
      padding-top: ${toPX(theme.spacing.xl)};
      padding-bottom: ${toPX(theme.spacing.xl)};
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const Illustration = (theme: Theme) =>
  css`
    position: relative;
    width: 104px;
    height: 86px;
    align-self: center;
    align-items: center;
    justify-content: center;
    border-width: ${toPX(theme.border.width.md)};
    border-color: ${theme.colors.shades.primary.lg};
    border-radius: ${toPX(theme.radius.lg)};
    background-color: ${theme.colors.shades.primary.sm};
  ` as StyleProp<ViewStyle>;

export const CheckBadge = (theme: Theme) =>
  css`
    position: absolute;
    top: -9px;
    right: -9px;
    width: 32px;
    height: 32px;
    align-items: center;
    justify-content: center;
    border-width: 4px;
    border-color: ${theme.colors.bg};
    border-radius: ${toPX(theme.radius.full)};
    background-color: ${theme.colors.success};
  ` as StyleProp<ViewStyle>;

export const Heading = (theme: Theme) =>
  [
    globalStyles.StackContainer(theme, 'sm'),
    css`
      align-items: center;
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const Title = (theme: Theme) =>
  css`
    color: ${theme.colors.text};
    font-size: ${toPX(theme.size.xl)};
    font-weight: ${theme.weight.bold};
    line-height: ${toPX(theme.lineHeight['2xl'])};
    text-align: center;
  ` as StyleProp<TextStyle>;

export const Description = (theme: Theme) =>
  css`
    max-width: 320px;
    color: ${theme.colors.muted};
    font-size: ${toPX(theme.size.base)};
    font-weight: ${theme.weight.regular};
    line-height: ${toPX(theme.lineHeight.md)};
    text-align: center;
  ` as StyleProp<TextStyle>;

export const Email = (theme: Theme) =>
  [
    globalStyles.Row(theme, 'center', 'center', 'sm'),
    css`
      align-self: center;
      padding: ${toPX(theme.spacing.sm)} ${toPX(theme.spacing.md)};
      border-width: ${toPX(theme.border.width.sm)};
      border-color: ${theme.colors.border};
      border-radius: ${toPX(theme.radius.full)};
      background-color: ${theme.colors.card};
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const EmailText = (theme: Theme) =>
  css`
    color: ${theme.colors.text};
    font-size: ${toPX(theme.size.base)};
    font-weight: ${theme.weight.bold};
    line-height: ${toPX(theme.lineHeight.md)};
  ` as StyleProp<TextStyle>;

export const SuccessMessage = (theme: Theme) =>
  css`
    padding: ${toPX(theme.spacing.md)};
    border-width: ${toPX(theme.border.width.sm)};
    border-color: ${theme.colors.shades.success.lg};
    border-radius: ${toPX(theme.radius.md)};
    background-color: ${theme.colors.shades.success.sm};
  ` as StyleProp<ViewStyle>;

export const SuccessMessageText = (theme: Theme) =>
  css`
    color: ${theme.colors.shades.success.text};
    font-size: ${toPX(theme.size.sm)};
    font-weight: ${theme.weight.medium};
    line-height: ${toPX(theme.lineHeight.sm)};
    text-align: center;
  ` as StyleProp<TextStyle>;

export const Actions = (theme: Theme) =>
  globalStyles.StackContainer(theme, 'sm');

export const PrimaryButton = (theme: Theme, disabled: boolean) =>
  [
    globalStyles.ButtonStyles(theme, disabled),
    css`
      min-height: 48px;
      color: ${theme.colors.white};
    ` as ActionStyle,
  ] as ActionStyle;

export const PrimaryButtonText = (theme: Theme) =>
  globalStyles.ButtonText(theme);

export const LogoutButton = (theme: Theme, disabled: boolean) =>
  css`
    min-height: 48px;
    align-items: center;
    justify-content: center;
    border-width: ${toPX(theme.border.width.sm)};
    border-color: ${theme.colors.danger};
    border-radius: ${toPX(theme.radius.md)};
    background-color: transparent;
    color: ${theme.colors.danger};
    opacity: ${disabled ? 0.55 : 1};
  ` as ActionStyle;

export const LogoutButtonText = (theme: Theme) =>
  css`
    color: ${theme.colors.danger};
    font-size: ${toPX(theme.size.md)};
    font-weight: ${theme.weight.bold};
    line-height: ${toPX(theme.lineHeight.md)};
  ` as StyleProp<TextStyle>;
