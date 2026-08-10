import styled from '@emotion/native';

import * as ss from '@shared/styles';

export const Content = styled.View`
  align-items: center;
  justify-content: center;

  gap: ${({ theme }) => ss.px(theme.spacing.lg)};

  padding-vertical: ${({ theme }) => ss.px(theme.spacing['2xl'])};
`;

export const Text = styled.Text`
  ${({ theme }) => ss.Subheading(theme)};

  text-align: center;
`;
