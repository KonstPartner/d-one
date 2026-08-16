import styled from '@emotion/native';

import * as ss from '@shared/styles';

import { Button } from '../Button';

export type ConfirmDialogTone = 'primary' | 'danger';

export const Backdrop = styled.Pressable`
  flex: 1;

  padding: ${({ theme }) => ss.px(theme.spacing.lg)};

  background-color: rgba(0, 0, 0, 0.72);
`;

export const Card = styled.Pressable`
  width: 100%;
  max-width: 460px;

  gap: ${({ theme }) => ss.px(theme.spacing.lg)};

  padding: ${({ theme }) => ss.px(theme.spacing.lg)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};

  border-color: ${({ theme }) => theme.colors.border};

  background-color: ${({ theme }) => theme.colors.card};
`;

export const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
`;

export const Description = styled.Text``;

export const StandardActions = styled.View`
  flex-direction: row;
  align-items: stretch;

  gap: ${({ theme }) => ss.px(theme.spacing.md)};
`;

export const StandardActionButton = styled(Button)`
  flex: 1;
`;

export const StandardButtonText = styled.Text`
  text-align: center;
`;

export const ActionGroups = styled.View`
  width: 100%;

  gap: ${({ theme }) => ss.px(theme.spacing.md)};
`;

export const ActionRow = styled.View`
  width: 100%;

  flex-direction: row;
  align-items: stretch;

  gap: ${({ theme }) => ss.px(theme.spacing.md)};
`;

export const ActionButton = styled(Button)`
  flex: 1;

  min-width: 0;

  padding-left: ${({ theme }) => ss.px(theme.spacing.sm)};

  padding-right: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const CancelActionButton = styled(Button)`
  width: 100%;
`;

export const ActionContent = styled.View`
  width: 100%;

  flex-direction: row;
  align-items: center;
  justify-content: center;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const ActionLabel = styled.Text`
  flex-shrink: 1;

  text-align: center;
`;
