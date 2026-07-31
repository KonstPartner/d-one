import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { css } from '@emotion/native';
import { Theme } from '@emotion/react';

import * as globalStyles from '@features/shared/styles/global';
import { toPX } from '@features/theme/model';

export const UnsupportedContent = (theme: Theme) =>
  [
    globalStyles.Stack(theme, 'md'),
    css`
      flex: 1;
      width: 100%;
      max-width: 520px;
      align-self: center;
      align-items: center;
      justify-content: center;
      padding-horizontal: ${toPX(theme.spacing.xl)};
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const CenteredText = css`
  text-align: center;
` as StyleProp<TextStyle>;
