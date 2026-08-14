import styled, { css } from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { ViewStyle } from 'react-native';

import * as ss from '@shared/styles';

import { Input } from '../Input';

export const Root = styled.View`
  position: relative;

  flex-direction: row;
  align-items: center;
`;

export const SearchButton = styled.Pressable`
  ${({ theme }) => ss.Rounded(theme, 'full')};

  position: absolute;
  left: 14px;

  z-index: 1;

  padding: 2px;
`;

export const ClearButton = styled.Pressable`
  ${ss.CenterContent};

  position: absolute;
  right: 14px;

  z-index: 1;
`;

export const Field = styled(Input)`
  ${ss.FullWidth};

  padding-left: 44px;

  padding-right: ${({ value }) =>
    ss.px(String(value ?? '').length > 0 ? 44 : 16)};

  padding-top: ${({ withLabel }) => ss.px(withLabel ? 30 : 12)};

  border-radius: ${({ theme }) => ss.px(theme.radius.full)};
`;

export const getSearchButtonStyle = (
  theme: Theme,
  withLabel: boolean,
  focused: boolean
) =>
  css`
    top: ${ss.px(withLabel ? 36 : 10)};

    background-color: ${focused ? theme.colors.card : theme.colors.input};
  ` as ViewStyle;

export const getClearButtonStyle = (withLabel: boolean) =>
  css`
    top: ${ss.px(withLabel ? 37 : 15)};
  ` as ViewStyle;
