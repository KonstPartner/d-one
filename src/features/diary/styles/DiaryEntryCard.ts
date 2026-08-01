import { StyleProp, ViewStyle } from 'react-native';
import { css } from '@emotion/native';
import { Theme } from '@emotion/react';

import * as globalStyles from '@features/shared/styles/global';

export const Card = (theme: Theme, pendingDelete: boolean) =>
  [
    globalStyles.Surface(theme, pendingDelete ? 'input' : 'card'),
    globalStyles.Rounded(theme, 'md'),
    globalStyles.Inset(theme, 'md'),
    globalStyles.Stack(theme, 'md'),
  ] as StyleProp<ViewStyle>;

export const Pressed = css`
  opacity: 0.72;
` as StyleProp<ViewStyle>;

export const Header = (theme: Theme) =>
  globalStyles.Row(theme, 'center', 'space-between', 'sm');

export const MealRelation = (theme: Theme) =>
  [
    globalStyles.Surface(theme, 'primarySoft', false),
    globalStyles.Rounded(theme, 'full'),
    globalStyles.InsetX(theme, 'sm'),
    globalStyles.InsetY(theme, 'xs'),
  ] as StyleProp<ViewStyle>;

export const Metrics = (theme: Theme) => globalStyles.Cluster(theme, 'sm');

export const Metric = (theme: Theme) =>
  [
    globalStyles.Surface(theme, 'background', false),
    globalStyles.Rounded(theme, 'full'),
    globalStyles.InsetX(theme, 'sm'),
    globalStyles.InsetY(theme, 'xs'),
    globalStyles.Row(theme, 'center', 'flex-start', 'xs'),
  ] as StyleProp<ViewStyle>;

export const TextSection = (theme: Theme) => globalStyles.Stack(theme, 'xs');

export const Status = (theme: Theme) =>
  globalStyles.Row(theme, 'center', 'flex-start', 'xs');
