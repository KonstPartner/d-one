import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { css } from '@emotion/native';
import { Theme } from '@emotion/react';

import { toPX } from '@features/theme/model';

export const Wrapper = css`
  width: 100%;
  margin: 0 auto;
  align-items: center;
  gap: 5px;
` as StyleProp<ViewStyle>;

export const Label = (theme: Theme) =>
  css`
    color: ${theme.colors.muted};
    font-size: ${toPX(theme.size.base)};
    font-weight: 500;
  ` as StyleProp<TextStyle>;

export const Container = (theme: Theme) =>
  css`
    width: 100%;
    min-height: 40px;
    padding: 4px;
    border-width: 1px;
    border-color: ${theme.colors.border};
    border-radius: ${toPX(theme.radius.lg)};
    background-color: ${theme.colors.input};
    flex-direction: row;
    align-items: center;
    overflow: hidden;
  ` as StyleProp<ViewStyle>;

export const Segment = (
  theme: Theme,
  active: boolean,
  disabled: boolean = false
) =>
  css`
    flex: 1;
    min-height: 32px;
    align-items: center;
    justify-content: center;
    border-radius: ${toPX(theme.radius.lg)};
    background-color: ${active ? theme.colors.primary : 'transparent'};
    opacity: ${disabled ? 0.55 : 1};
  ` as StyleProp<ViewStyle>;

export const SegmentText = (
  theme: Theme,
  active: boolean,
  disabled: boolean = false
) =>
  css`
    color: ${active ? theme.colors.white : theme.colors.text};
    font-size: ${toPX(theme.size.md)};
    font-weight: 700;
    opacity: ${disabled ? 0.75 : 1};
  ` as StyleProp<TextStyle>;
