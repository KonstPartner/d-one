import { css } from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { ImageStyle, StyleProp, TextStyle, ViewStyle } from 'react-native';

import { toPX } from '@features/theme/model';

export const Frame = (theme: Theme) =>
  css`
    position: relative;
    width: 100%;
    aspect-ratio: 1.7777778;
    overflow: hidden;
    border-radius: ${toPX(theme.spacing.sm)};
    background-color: ${theme.colors.bg};
  ` as StyleProp<ViewStyle>;

export const Image = css`
  width: 100%;
  height: 100%;
` as StyleProp<ImageStyle>;

export const CenteredOverlay = (theme: Theme) =>
  css`
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;

    align-items: center;
    justify-content: center;

    padding: ${toPX(theme.spacing.md)};
    background-color: ${theme.colors.bg};
  ` as StyleProp<ViewStyle>;

export const FallbackText = css`
  margin-top: 8px;
  text-align: center;
` as StyleProp<TextStyle>;

export const Indicator = (theme: Theme) =>
  css`
    position: absolute;
    top: ${toPX(theme.spacing.sm)};
    right: ${toPX(theme.spacing.sm)};

    align-items: center;
    justify-content: center;

    padding: ${toPX(theme.spacing.xs)};
    border-radius: ${toPX(theme.size.xl)};
    background-color: rgba(0, 0, 0, 0.6);
  ` as StyleProp<ViewStyle>;

export const Pressed = css`
  opacity: 0.85;
` as StyleProp<ViewStyle>;
