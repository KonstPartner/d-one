import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { css } from '@emotion/native';
import { Theme } from '@emotion/react';

import { toPX } from '@features/theme/model';

export const Container = css`
  width: 100%;
` as StyleProp<ViewStyle>;

export const CharCountView = css`
  padding: 5px;
` as StyleProp<ViewStyle>;

export const TextArea = (theme: Theme) =>
  css`
    width: 100%;
    height: 220px;
    padding: ${toPX(theme.spacing.md)};
    background-color: ${theme.colors.bg};
  ` as any;

export const CharCount = (theme: Theme) =>
  css`
    font-size: ${toPX(theme.size.sm)};
    color: ${theme.colors.muted};
    text-align: right;
  ` as StyleProp<TextStyle>;
