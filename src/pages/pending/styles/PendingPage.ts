import styled from '@emotion/native';

import * as ss from '@shared/styles';

export const Content = styled.View`
  ${ss.CenterContent};

  flex: 1;
`;

export const Card = styled.View`
  ${ss.FullWidth};

  ${({ theme }) => ss.CardContainer(theme, '2xl', 'xl')};

  max-width: 520px;

  align-items: center;

  gap: ${({ theme }) => theme.spacing.xl}px;
`;

export const Icon = styled.View`
  ${ss.CenterContent};

  ${({ theme }) => ss.Rounded(theme, 'full')};

  width: ${({ theme }) => theme.spacing['5xl'] + theme.spacing['2xl']}px;

  height: ${({ theme }) => theme.spacing['5xl'] + theme.spacing['2xl']}px;

  background-color: ${({ theme }) => theme.colors.shades.primary.sm};
`;

export const TextContent = styled.View`
  ${ss.FullWidth};

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
