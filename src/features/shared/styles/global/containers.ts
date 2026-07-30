import { StyleProp, ViewStyle } from 'react-native';
import { css } from '@emotion/native';
import { Theme } from '@emotion/react';

import { toPX } from '@features/theme/model';

import { Stack } from './layout';
import { CardContainer } from './surfaces';
import { ThemeSpacing } from './types';

export const PageRoot = (theme: Theme) =>
  css`
    flex: 1;
    background-color: ${theme.colors.bg};
  ` as StyleProp<ViewStyle>;

export const PageContainer = (theme: Theme) =>
  css`
    flex: 1;
    padding-left: ${toPX(theme.spacing.md)};
    padding-right: ${toPX(theme.spacing.md)};
  ` as StyleProp<ViewStyle>;

export const PageContent = (theme: Theme) =>
  css`
    gap: ${toPX(theme.spacing.lg)};
  ` as StyleProp<ViewStyle>;

export const GapContainer = (gap?: number) =>
  css`
    gap: ${typeof gap === 'number' ? gap + 'px' : '8px'};
  ` as StyleProp<ViewStyle>;

export const StackContainer = (theme: Theme, gap: ThemeSpacing = 'md') =>
  Stack(theme, gap);

export const FloatContainer = (theme: Theme) =>
  CardContainer(theme, 'lg', 'lg');
