import styled from '@emotion/native';
import type { ViewStyle } from 'react-native';

import * as ss from '@shared/styles';

import { Button } from '../Button';

export const Scroll = styled.ScrollView``;

export const contentStyle: ViewStyle = {
  flexGrow: 1,

  alignItems: 'center',
  justifyContent: 'center',
};

export const NavigationButton = styled(Button)`
  width: ${({ theme }) => ss.px(theme.control.height.md)};

  padding-horizontal: 0;
  padding-vertical: 0;

  margin-horizontal: ${({ theme }) => ss.px(theme.spacing.xs)};
`;

export const PageButton = styled(Button)`
  min-width: ${({ theme }) => ss.px(theme.control.height.md)};

  padding-horizontal: ${({ theme }) => ss.px(theme.spacing.sm)};

  margin-horizontal: ${({ theme }) => ss.px(theme.spacing.xs)};
`;

type PageTextProps = {
  $current: boolean;
};

export const PageText = styled.Text<PageTextProps>`
  ${({ theme }) => ss.Text(theme, 'base', 'bold')};

  color: ${({ theme, $current }) =>
    $current ? theme.colors.white : theme.colors.text};
`;
