import { StyleProp, ViewStyle } from 'react-native';
import { css } from '@emotion/native';
import { Theme } from '@emotion/react';

import * as globalStyles from '@features/shared/styles/global';
import { toPX } from '@features/theme/model';

export const Scroll = css`
  flex: 1;
` as StyleProp<ViewStyle>;

export const ScrollContent = (theme: Theme) =>
  css`
    flex-grow: 1;
    justify-content: center;
    padding-top: ${toPX(theme.spacing.lg)};
    padding-bottom: ${toPX(theme.spacing.lg)};
  ` as StyleProp<ViewStyle>;

export const VerificationContent = (theme: Theme) =>
  [
    globalStyles.StackContainer(theme, 'lg'),
    css`
      width: 100%;
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;
