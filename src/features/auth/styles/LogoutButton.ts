import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { css } from '@emotion/native';
import { Theme } from '@emotion/react';

import { toPX } from '@features/theme/model';

type ButtonStyleType = StyleProp<ViewStyle> & StyleProp<TextStyle>;

export const ButtonStyle = (theme: Theme, disabled: boolean) =>
  css`
    min-height: 48px;
    align-items: center;
    justify-content: center;
    border-width: 1px;
    border-color: ${theme.colors.danger};
    border-radius: ${toPX(theme.radius.md)};
    background-color: transparent;
    opacity: ${disabled ? 0.55 : 1};
  ` as ButtonStyleType;

export const ButtonText = (theme: Theme) =>
  css`
    color: ${theme.colors.danger};
    font-size: ${toPX(theme.size.md)};
    font-weight: ${theme.weight.bold};
    line-height: ${toPX(theme.lineHeight.md)};
  ` as StyleProp<TextStyle>;
