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

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const SecondaryActionText = styled.Text`
  ${({ theme }) => ss.Text(theme)};

  color: ${({ theme }) => theme.colors.text};
`;

export const DeleteActionText = styled.Text`
  ${({ theme }) => ss.Text(theme)};

  color: ${({ theme }) => theme.colors.white};
`;
