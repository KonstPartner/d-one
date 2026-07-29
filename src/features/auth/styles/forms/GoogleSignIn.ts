import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { css } from '@emotion/native';
import type { Theme } from '@emotion/react';

import { toPX } from '@features/theme/model';

type GoogleButtonStyle = StyleProp<ViewStyle> & StyleProp<TextStyle>;

export const ButtonStyle = (theme: Theme, disabled: boolean) =>
  css`
    min-height: 48px;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: ${toPX(theme.spacing.sm)};
    border-width: 1px;
    border-color: ${theme.colors.border};
    border-radius: ${toPX(theme.radius.md)};
    background-color: ${theme.colors.bg};
    opacity: ${disabled ? 0.55 : 1};
  ` as GoogleButtonStyle;

export const ButtonText = (theme: Theme) =>
  css`
    color: ${theme.colors.text};
    font-size: ${toPX(theme.size.md)};
    font-weight: ${theme.weight.medium};
    line-height: ${toPX(theme.lineHeight.md)};
  ` as StyleProp<TextStyle>;
