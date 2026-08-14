import styled from '@emotion/native';

import * as ss from '@shared/styles';

export const Content = styled.View`
  flex: 1;
`;

export const Card = styled.View`
  ${({ theme }) => ss.CardContainer(theme, '2xl', 'xl')};

  max-width: 520px;

  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.xl)};
`;

export const Icon = styled.View`
  width: ${({ theme }) => ss.px(theme.spacing['5xl'] + theme.spacing['2xl'])};

  height: ${({ theme }) => ss.px(theme.spacing['5xl'] + theme.spacing['2xl'])};

  background-color: ${({ theme }) => theme.colors.shades.primary.sm};
`;

export const TextContent = styled.View`
  ${({ theme }) => ss.Stack(theme, 'md')};

  align-items: center;
`;

export const Title = styled.Text`
  ${({ theme }) => ss.Heading(theme)};

  text-align: center;
`;

export const Description = styled.Text`
  ${({ theme }) => ss.Text(theme, 'base', 'regular', 'muted', 'md')};

  text-align: center;
`;
