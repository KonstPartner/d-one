import { css } from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { TextStyle, ViewStyle } from 'react-native';

import { px } from './toPX';
import type { FlexAlign, FlexJustify, ThemeSpacing } from './types';

export const Stack = (theme: Theme, gap: ThemeSpacing = 'sm') =>
  css`
    gap: ${px(theme.spacing[gap])};
  ` as ViewStyle;

export const Row = (
  theme: Theme,
  align: FlexAlign = 'center',
  justify: FlexJustify = 'flex-start',
  gap: ThemeSpacing = 'sm'
) =>
  css`
    flex-direction: row;
    align-items: ${align};
    justify-content: ${justify};
    gap: ${px(theme.spacing[gap])};
  ` as ViewStyle;

export const Cluster = (
  theme: Theme,
  gap: ThemeSpacing = 'sm',
  align: FlexAlign = 'center'
) =>
  css`
    flex-direction: row;
    flex-wrap: wrap;
    align-items: ${align};
    gap: ${px(theme.spacing[gap])};
  ` as ViewStyle;

export const ActionsRow = (theme: Theme, gap: ThemeSpacing = 'md') =>
  css`
    ${Row(theme, 'center', 'space-between', gap)};
  ` as ViewStyle;

export const GapContainer = (gap = 8) =>
  css`
    gap: ${px(gap)};
  ` as ViewStyle;

export const FullWidth = css`
  width: 100%;
` as ViewStyle & TextStyle;

export const Flex = { flex: 1 };

export const FlexItem = css`
  flex: 1;
  flex-basis: 0px;
  min-width: 0px;
` as ViewStyle;

export const CenterContent = css`
  align-items: center;
  justify-content: center;
` as ViewStyle;

export const PrimeLayer = css`
  position: relative;
  z-index: 10000;
  elevation: 30;
` as ViewStyle;

export const PageRoot = (theme: Theme) =>
  css`
    flex: 1;
    background-color: ${theme.colors.bg};
  ` as ViewStyle;

export const PageContainer = (theme: Theme) =>
  css`
    flex: 1;
    padding-left: ${px(theme.spacing.md)};
    padding-right: ${px(theme.spacing.md)};
  ` as ViewStyle;

export const PageContent = (theme: Theme) =>
  css`
    ${Stack(theme, 'lg')};
  ` as ViewStyle;
