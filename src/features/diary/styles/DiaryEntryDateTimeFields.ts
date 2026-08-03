import { css } from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { toPX } from '@features/theme/model';

export const Container = (theme: Theme) =>
  css`
    gap: ${toPX(theme.spacing.sm)};
  ` as StyleProp<ViewStyle>;

export const Controls = (theme: Theme) =>
  css`
    flex-direction: row;
    gap: ${toPX(theme.spacing.sm)};
  ` as StyleProp<ViewStyle>;

export const Control = (theme: Theme) =>
  css`
    flex: 1;
    min-height: ${toPX(theme.control.height.md)};
    flex-direction: row;
    align-items: center;
    gap: ${toPX(theme.spacing.sm)};
    border-width: ${toPX(theme.border.width.sm)};
    border-color: ${theme.colors.border};
    border-radius: ${toPX(theme.radius.md)};
    background-color: ${theme.colors.input};
    padding: 0 ${toPX(theme.spacing.md)};
  ` as StyleProp<ViewStyle>;

export const ControlText = (theme: Theme, disabled: boolean) =>
  css`
    flex: 1;
    color: ${disabled ? theme.colors.muted : theme.colors.text};
    font-size: ${toPX(theme.size.sm)};
    line-height: ${toPX(theme.lineHeight.md)};
    font-weight: ${theme.weight.medium};
  ` as StyleProp<TextStyle>;

export const CurrentDateTime = (theme: Theme) =>
  css`
    min-height: ${toPX(theme.control.height.md)};
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: ${toPX(theme.spacing.md)};
    border-width: ${toPX(theme.border.width.sm)};
    border-color: ${theme.colors.border};
    border-radius: ${toPX(theme.radius.md)};
    background-color: ${theme.colors.card};
    padding: 0 ${toPX(theme.spacing.md)};
  ` as StyleProp<ViewStyle>;

export const CurrentDateTimeAction = (theme: Theme) =>
  css`
    min-height: ${toPX(theme.control.height.md)};
    flex: 1;
    flex-direction: row;
    align-items: center;
    gap: ${toPX(theme.spacing.md)};
  ` as StyleProp<ViewStyle>;

export const CurrentDateTimeLabel = (theme: Theme, disabled: boolean) =>
  css`
    flex: 1;
    color: ${disabled ? theme.colors.muted : theme.colors.text};
    font-size: ${toPX(theme.size.sm)};
    line-height: ${toPX(theme.lineHeight.md)};
    font-weight: ${theme.weight.semibold};
  ` as StyleProp<TextStyle>;
