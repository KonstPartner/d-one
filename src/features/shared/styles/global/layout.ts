import { StyleProp, ViewStyle } from 'react-native';
import { css } from '@emotion/native';
import { Theme } from '@emotion/react';

import {
  FlexAlign,
  FlexDirection,
  FlexJustify,
  ThemeSpacing,
} from '@features/shared/styles/global/types';
import { toPX } from '@features/theme/model';

const normalizeFlex = (value?: string) => {
  if (!value || value === 'start') {
    return 'flex-start';
  }

  if (value === 'end') {
    return 'flex-end';
  }

  return value;
};

export const Stack = (theme: Theme, gap: ThemeSpacing = 'sm') =>
  css`
    gap: ${toPX(theme.spacing[gap])};
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
    gap: ${toPX(theme.spacing[gap])};
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
    gap: ${toPX(theme.spacing[gap])};
  ` as StyleProp<ViewStyle>;

export const FullWidth = css`
  width: 100%;
` as StyleProp<ViewStyle>;

export const FlexItem = css`
  flex: 1;
  flex-basis: 0px;
` as StyleProp<ViewStyle>;

export const CenterContent = css`
  align-items: center;
  justify-content: center;
` as StyleProp<ViewStyle>;

export const ActionsRow = (theme: Theme, gap: ThemeSpacing = 'md') =>
  Row(theme, 'center', 'space-between', gap);

export const ContainerFlex = (
  direction: FlexDirection | string,
  justify?: FlexJustify | string,
  align?: FlexAlign | string,
  gap?: number
) =>
  css`
    flex-direction: ${normalizeFlex(direction)};
    justify-content: ${normalizeFlex(justify)};
    align-items: ${normalizeFlex(align)};
    ${typeof gap === 'number' ? `gap: ${gap}px;` : ''}
  ` as StyleProp<ViewStyle>;
