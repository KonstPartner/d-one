import styled, { css } from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { TextStyle } from 'react-native';

import * as ss from '@shared/styles';

export const Label = styled.Text`
  ${({ theme }) => ss.Label(theme)};
`;

export const Field = styled.TextInput<{ $focused: boolean }>`
  width: 100%;

  background-color: ${({ theme, $focused }) =>
    $focused ? theme.colors.card : theme.colors.input};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-style: solid;

  border-color: ${({ theme, $focused }) =>
    $focused ? theme.colors.primary : 'transparent'};

  border-radius: ${({ theme }) => ss.px(theme.radius.sm)};

  padding: ${({ theme }) =>
    `${ss.px(theme.spacing.md)} ${ss.px(theme.spacing.lg)}`};

  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => ss.px(theme.size.md)};
`;

export const getFocusedFieldStyle = (theme: Theme) =>
  css`
    background-color: ${theme.colors.card};
    border-color: ${theme.colors.primary};
  ` as TextStyle;
