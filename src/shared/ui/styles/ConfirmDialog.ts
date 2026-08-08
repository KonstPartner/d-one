import styled from '@emotion/native';

import * as ss from '@shared/styles';

import { Button } from '../Button';

export type ConfirmDialogTone = 'primary' | 'danger';

export const Backdrop = styled.Pressable`
  ${({ theme }) => ss.Inset(theme, 'lg')};
  ${ss.CenterContent};

  flex: 1;

  background-color: rgba(0, 0, 0, 0.5);
`;

export const Card = styled.Pressable`
  ${ss.FullWidth};

  ${({ theme }) => ss.Stack(theme, 'md')};
  ${({ theme }) => ss.Inset(theme, 'lg')};
  ${({ theme }) => ss.Surface(theme, 'background')};
  ${({ theme }) => ss.Rounded(theme, 'md')};

  max-width: 500px;
`;

export const Title = styled.Text`
  ${({ theme }) => ss.Text(theme, 'lg', 'bold', 'default', 'xl')};
`;

export const Description = styled.Text`
  ${({ theme }) => ss.Body(theme)};
`;

export const Actions = styled.View`
  ${({ theme }) => ss.Row(theme, 'center', 'flex-start', 'md')};
`;

export const ActionButton = styled(Button)`
  flex: 1;
`;

export const ConfirmButtonText = styled.Text`
  ${({ theme }) => ss.Text(theme, 'md', 'bold', 'inverse', 'md')};

  text-align: center;
`;

export const CancelButtonText = styled.Text`
  ${({ theme }) => ss.Text(theme, 'md', 'bold', 'default', 'md')};

  text-align: center;
`;
