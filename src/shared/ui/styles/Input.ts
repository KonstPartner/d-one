import styled from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { TextStyle } from 'react-native';

export const Label = styled.Text`
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.size.sm}px;
  font-weight: ${({ theme }) => theme.weight.medium};
  line-height: ${({ theme }) => theme.lineHeight.sm}px;
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

export const Field = styled.TextInput`
  width: 100%;

  background-color: ${({ theme }) => theme.colors.input};

  border-width: 1px;
  border-style: solid;
  border-color: transparent;
  border-radius: 6px;

  padding: 12px 16px;

  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};

  outline-width: 0;
  outline-style: none;
  box-shadow: none;
`;

export const getFocusedFieldStyle = (theme: Theme): TextStyle => ({
  backgroundColor: theme.colors.card,
  borderColor: theme.colors.primary,
});

export const ValidationMessage = styled.Text`
  color: red;
`;
