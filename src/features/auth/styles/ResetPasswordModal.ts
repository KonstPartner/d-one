import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { css } from '@emotion/native';
import type { Theme } from '@emotion/react';

export const Trigger = css`
  align-self: center;
` as StyleProp<ViewStyle>;

export const Content = css`
  width: 100%;
  max-width: 420px;
  gap: 18px;
` as StyleProp<ViewStyle>;

export const Head = css`
  gap: 6px;
` as StyleProp<ViewStyle>;

export const Title = (theme: Theme) =>
  css`
    color: ${theme.colors.text};
    font-size: 20px;
    font-weight: 700;
    line-height: 26px;
  ` as StyleProp<TextStyle>;

export const Description = (theme: Theme) =>
  css`
    color: ${theme.colors.muted};
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
  ` as StyleProp<TextStyle>;

export const Input = css`
  min-height: 48px;
` as StyleProp<ViewStyle>;

export const Actions = css`
  gap: 10px;
` as StyleProp<ViewStyle>;

export const PrimaryButton = (disabled: boolean) =>
  css`
    min-height: 48px;
    opacity: ${disabled ? 0.6 : 1};
  ` as StyleProp<ViewStyle>;

export const SecondaryButton = css`
  min-height: 48px;
` as StyleProp<ViewStyle>;
