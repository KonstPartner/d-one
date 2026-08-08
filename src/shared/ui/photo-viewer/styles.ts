import { css } from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { ImageStyle, StyleProp, TextStyle, ViewStyle } from 'react-native';

import { toPX } from '@features/theme/model';

export const Root = (theme: Theme) =>
  css`
    flex: 1;
    background-color: ${theme.colors.black};
  ` as StyleProp<ViewStyle>;

export const Viewport = css`
  flex: 1;
  overflow: hidden;
  align-items: center;
  justify-content: center;
` as StyleProp<ViewStyle>;

export const ImageFrame = css`
  align-items: center;
  justify-content: center;
` as StyleProp<ViewStyle>;

export const UnmeasuredImageFrame = css`
  width: 100%;
  height: 100%;
` as StyleProp<ViewStyle>;

export const Image = css`
  width: 100%;
  height: 100%;
` as StyleProp<ImageStyle>;

export const StateOverlay = css`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  align-items: center;
  justify-content: center;
` as StyleProp<ViewStyle>;

export const StateText = (theme: Theme) =>
  css`
    max-width: 80%;
    margin-top: ${toPX(theme.spacing.md)};
    color: ${theme.colors.white};
    font-size: ${toPX(theme.size.sm)};
    font-weight: ${theme.weight.medium};
    line-height: ${toPX(theme.lineHeight.sm)};
    text-align: center;
  ` as StyleProp<TextStyle>;

export const Controls = (theme: Theme) =>
  css`
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    align-items: flex-end;
    padding: ${toPX(theme.spacing.md)};
  ` as StyleProp<ViewStyle>;

export const CloseButton = (theme: Theme) =>
  css`
    width: ${toPX(theme.control.height.md)};
    height: ${toPX(theme.control.height.md)};
    align-items: center;
    justify-content: center;
    border-radius: ${toPX(theme.radius.full)};
    background-color: ${theme.colors.blackAlpha.xl};
  ` as StyleProp<ViewStyle>;

export const HintArea = (theme: Theme) =>
  css`
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    align-items: center;
    padding: ${toPX(theme.spacing.md)};
  ` as StyleProp<ViewStyle>;

export const HintText = (theme: Theme) =>
  css`
    padding: ${toPX(theme.spacing.sm)} ${toPX(theme.spacing.md)};
    overflow: hidden;
    border-radius: ${toPX(theme.radius.full)};
    color: ${theme.colors.white};
    background-color: ${theme.colors.blackAlpha.xl};
    font-size: ${toPX(theme.size.sm)};
    line-height: ${toPX(theme.lineHeight.sm)};
    text-align: center;
  ` as StyleProp<TextStyle>;

export const Pressed = css`
  opacity: 0.7;
` as StyleProp<ViewStyle>;
