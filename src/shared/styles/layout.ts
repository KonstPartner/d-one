import { css } from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { StyleProp, ViewStyle } from 'react-native';

import type { FlexAlign, FlexJustify, ThemeSpacing } from './types';

export const Stack = (theme: Theme, gap: ThemeSpacing = 'sm') =>
  css`
    gap: ${theme.spacing[gap]}px;
  ` as StyleProp<ViewStyle>;

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
    gap: ${theme.spacing[gap]}px;
  ` as StyleProp<ViewStyle>;

export const Cluster = (
  theme: Theme,
  gap: ThemeSpacing = 'sm',
  align: FlexAlign = 'center'
) =>
  css`
    flex-direction: row;
    flex-wrap: wrap;
    align-items: ${align};
    gap: ${theme.spacing[gap]}px;
  ` as StyleProp<ViewStyle>;

export const ActionsRow = (theme: Theme, gap: ThemeSpacing = 'md') =>
  Row(theme, 'center', 'space-between', gap);

export const GapContainer = (gap = 8) =>
  css`
    gap: ${gap}px;
  ` as StyleProp<ViewStyle>;

export const FullWidth = css`
  width: 100%;
` as StyleProp<ViewStyle>;

export const FlexItem = css`
  flex: 1;
  flex-basis: 0px;
  min-width: 0px;
` as StyleProp<ViewStyle>;

export const CenterContent = css`
  align-items: center;
  justify-content: center;
` as StyleProp<ViewStyle>;

export const PrimeLayer = css`
  position: relative;
  z-index: 10000;
  elevation: 30;
` as StyleProp<ViewStyle>;

export const PageRoot = (theme: Theme) =>
  css`
    flex: 1;
    background-color: ${theme.colors.bg};
  ` as StyleProp<ViewStyle>;

export const PageContainer = (theme: Theme) =>
  css`
    flex: 1;
    padding-left: ${theme.spacing.md}px;
    padding-right: ${theme.spacing.md}px;
  ` as StyleProp<ViewStyle>;

export const PageContent = (theme: Theme) =>
  css`
    gap: ${theme.spacing.lg}px;
  ` as StyleProp<ViewStyle>;
