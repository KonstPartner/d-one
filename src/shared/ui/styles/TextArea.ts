import styled from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { TextStyle } from 'react-native';

export const Container = styled.View`
  width: 100%;
`;

export const CharacterCount = styled.Text`
  padding: 5px;

  color: ${({ theme }) => theme.colors.muted};

  font-size: ${({ theme }) => theme.size.sm}px;

  text-align: right;
`;

export const getInputStyle = (theme: Theme): TextStyle => ({
  width: '100%',
  height: 220,

  padding: theme.spacing.md,

  backgroundColor: theme.colors.bg,

  textAlignVertical: 'top',
});
