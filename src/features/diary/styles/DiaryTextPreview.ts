import { type StyleProp, type ViewStyle } from 'react-native';
import { css } from '@emotion/native';
import type { Theme } from '@emotion/react';

import * as globalStyles from '@features/shared/styles/global';

export const Section = (theme: Theme) => globalStyles.Stack(theme, 'xs');

export const TextFrame = css`
  position: relative;
` as StyleProp<ViewStyle>;

export const Measurement = css`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  opacity: 0;
` as StyleProp<ViewStyle>;

export const MoreButton = (theme: Theme) =>
  [
    globalStyles.CompactButton(theme, 'ghost'),
    css`
      align-self: flex-start;
      padding-left: 0;
      padding-right: 0;
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const Pressed = css`
  opacity: 0.7;
` as StyleProp<ViewStyle>;

export const Disabled = css`
  opacity: 0.45;
` as StyleProp<ViewStyle>;
