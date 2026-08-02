import { css } from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import * as globalStyles from '@features/shared/styles/global';
import { toPX } from '@features/theme/model';

export const OwnerContent = css`
  flex: 1;
` as StyleProp<ViewStyle>;

export const Toolbar = (theme: Theme) =>
  [
    globalStyles.Row(theme, 'center', 'flex-end', 'sm'),
    css`
      padding-top: ${toPX(theme.spacing.sm)};
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const CreateButton = (theme: Theme) =>
  [
    globalStyles.IconButton(theme, 'primary', 'lg'),
    css`
      border-radius: ${toPX(theme.radius.full)};
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

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
