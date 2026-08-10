import styled, { css } from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { TextStyle } from 'react-native';

import * as ss from '@shared/styles';

export const Label = styled.Text`
  ${({ theme }) => ss.Label(theme)};
`;

export const Container = styled.View`
  ${ss.FullWidth};

  position: relative;
`;

export const Toggle = styled.Pressable`
  ${ss.CenterContent};

  position: absolute;

  top: 0;
  right: 0;
  bottom: 0;

  width: ${({ theme }) => ss.px(theme.control.height.lg)};
`;

export const getFieldStyle = (theme: Theme) =>
  css`
    padding-right: ${ss.px(theme.control.height.lg)};
  ` as TextStyle;
