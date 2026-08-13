import styled from '@emotion/native';

import * as ss from '@shared/styles';

import { Button } from '../Button';

export type ConfirmDialogTone = 'primary' | 'danger';

export const Backdrop = styled.Pressable`
  flex: 1;

  align-items: center;
  justify-content: center;

  padding: ${({ theme }) => ss.px(theme.spacing.lg)};

  background-color: rgba(0, 0, 0, 0.72);
`;

export const Card = styled.Pressable`
  width: 100%;
  max-width: 500px;

  gap: ${({ theme }) => ss.px(theme.spacing.lg)};

  padding: ${({ theme }) => ss.px(theme.spacing.lg)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};

  border-color: ${({ theme }) => theme.colors.border};

  border-radius: ${({ theme }) => ss.px(theme.radius.lg)};

  background-color: ${({ theme }) => theme.colors.card};

  ${({ theme }) => ss.Shadow(theme, 'strong')};
`;

export const Title = styled.Text`
  ${({ theme }) => ss.Text(theme, 'lg', 'bold', 'default', 'xl')};
`;

export const Description = styled.Text`
  ${({ theme }) => ss.Body(theme)};

  color: ${({ theme }) => theme.colors.text};
`;

export const Actions = styled.View`
  flex-direction: row;
  align-items: stretch;

  gap: ${({ theme }) => ss.px(theme.spacing.md)};
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
