import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { css } from '@emotion/native';
import { Theme } from '@emotion/react';

import { toPX } from '@features/theme/model';

export const ManagerContainer = css`
  padding-left: 10px;
  padding-right: 10px;
` as StyleProp<ViewStyle>;

export const AnimatedWrap = css`
  width: 100%;
  max-width: 500px;
` as StyleProp<ViewStyle>;

export const ToastWrapper = css`
  width: 100%;
` as StyleProp<ViewStyle>;

export const Container = (theme: Theme) =>
  css`
    width: 100%;
    align-self: stretch;
    flex-direction: row;
    align-items: stretch;
    border-radius: ${toPX(theme.radius.md)};
    background-color: ${theme.colors.bg};
    border-width: 1px;
    border-color: ${theme.colors.border};
    overflow: hidden;
  ` as StyleProp<ViewStyle>;

export const Stripe = (accent: string) =>
  css`
    width: 6px;
    background-color: ${accent};
  ` as StyleProp<ViewStyle>;

export const Content = css`
  flex: 1;
  padding: 14px 14px;
` as StyleProp<ViewStyle>;

export const TitleRow = css`
  flex: 1;
  min-width: 0px;
` as StyleProp<ViewStyle>;

export const Title = (theme: Theme) =>
  css`
    color: ${theme.colors.text};
    font-size: 16px;
    font-weight: 800;
    flex: 1;
    min-width: 0px;
  ` as StyleProp<TextStyle>;

export const Message = (theme: Theme) =>
  css`
    margin-top: 8px;
    color: ${theme.colors.text};
    font-size: 14px;
    line-height: 20px;
  ` as StyleProp<TextStyle>;

export const CloseBtn = css`
  justify-content: center;
  align-items: center;
` as StyleProp<ViewStyle>;

export const ProgressTrack = (theme: Theme) =>
  css`
    margin-top: 12px;
    height: 4px;
    width: 100%;
    border-radius: 999px;
    background-color: ${theme.colors.card};
    overflow: hidden;
  ` as StyleProp<ViewStyle>;

export const ProgressFill = (accent: string) =>
  css`
    height: 4px;
    border-radius: 999px;
    background-color: ${accent};
  ` as StyleProp<ViewStyle>;
