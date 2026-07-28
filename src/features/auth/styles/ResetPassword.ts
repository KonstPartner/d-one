import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { css } from '@emotion/native';
import { Theme } from '@emotion/react';

import { toPX } from '@features/theme/model';

export const Trigger = css`
  align-self: center;
` as StyleProp<ViewStyle>;

export const Container = (theme: Theme) =>
  css`
    flex: 1;
    justify-content: center;
    gap: ${toPX(theme.spacing.lg)};
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
