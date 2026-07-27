import { StyleProp, ViewStyle } from 'react-native';
import { css } from '@emotion/native';
import { Theme } from '@emotion/react';

export const Container = (theme: Theme) =>
  css`
    height: 40px;
    width: 128px;
    padding: 4px;
    border-radius: 8px;
    border-width: 1px;
    border-color: ${theme.colors.border};
    background-color: ${theme.colors.card};
  ` as StyleProp<ViewStyle>;

export const ButtonBase = css`
  height: 32px;
  width: 32px;
  border-radius: 999px;
  align-items: center;
  justify-content: center;
` as StyleProp<ViewStyle>;

export const ButtonActive = (theme: Theme) =>
  css`
    background-color: ${theme.colors.primary};
  ` as StyleProp<ViewStyle>;

export const ButtonInactive = css`
  background-color: transparent;
` as StyleProp<ViewStyle>;
