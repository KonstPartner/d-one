import styled from '@emotion/native';

import * as ss from '@shared/styles';

import { Input } from '../Input';

export const Container = styled.View`
  ${ss.FullWidth};
`;

export const Field = styled(Input)`
  ${ss.FullWidth};

  height: 220px;

  padding: ${({ theme }) => ss.px(theme.spacing.md)};

  background-color: ${({ theme }) => theme.colors.bg};

  text-align-vertical: top;
`;

export const CharacterCount = styled.Text`
  ${({ theme }) => ss.Text(theme, 'sm', 'regular', 'muted', 'sm')};

  padding: 5px;

  text-align: right;
`;
