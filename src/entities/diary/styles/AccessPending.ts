import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { css } from '@emotion/native';
import { Theme } from '@emotion/react';

import * as globalStyles from '@features/shared/styles/global';
import { toPX } from '@features/theme/model';

export const Root = css`
  flex: 1;
  align-items: center;
  justify-content: center;
` as StyleProp<ViewStyle>;

export const Card = (theme: Theme) =>
  [
    globalStyles.CardContainer(theme, '2xl', 'xl'),
    css`
      width: 100%;
      max-width: 520px;
      align-items: center;
      gap: ${toPX(theme.spacing.xl)};
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const IconContainer = (theme: Theme) => {
  const size = theme.spacing['5xl'] + theme.spacing['2xl'];

  return css`
    width: ${toPX(size)};
    height: ${toPX(size)};
    border-radius: ${toPX(theme.radius.full)};
    background-color: ${theme.colors.shades.primary.sm};
    align-items: center;
    justify-content: center;
  ` as StyleProp<ViewStyle>;
};

export const Content = (theme: Theme) =>
  [
    globalStyles.Stack(theme, 'md'),
    css`
      width: 100%;
      align-items: center;
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const CenteredText = css`
  text-align: center;
` as StyleProp<TextStyle>;
