import styled from '@emotion/native';

import * as ss from '@shared/styles';

export const Root = styled.View`
  gap: ${({ theme }) => ss.px(theme.spacing.md)};

  padding-vertical: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const Count = styled.Text`
  ${({ theme }) => ss.Subheading(theme)};
`;

export const Actions = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const CloseView = styled.View`
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => ss.px(theme.spacing.lg)};

  background-color: ${({ theme }) => theme.colors.card};

  border-radius: ${({ theme }) => ss.px(theme.spacing.lg)};
`;

export const ActionText = styled.Text`
  ${({ theme }) => ss.Text(theme)};

  color: ${({ theme }) => theme.colors.text};
`;
