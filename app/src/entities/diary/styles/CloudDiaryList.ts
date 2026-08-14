import styled from '@emotion/native';

import * as ss from '@shared/styles';

export const ItemSeparator = styled.View`
  height: ${({ theme }) => ss.px(theme.spacing.lg)};
`;

export const Footer = styled.View`
  padding-top: ${({ theme }) => ss.px(theme.spacing.lg)};

  padding-bottom: ${({ theme }) => ss.px(theme.spacing.xl)};
`;

export const Empty = styled.View`
  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};

  padding-vertical: ${({ theme }) => ss.px(theme.spacing['2xl'])};

  padding-horizontal: ${({ theme }) => ss.px(theme.spacing.lg)};
`;

export const EmptyTitle = styled.Text`
  ${({ theme }) => ss.Subheading(theme)};

  text-align: center;
`;

export const EmptyDescription = styled.Text`
  ${({ theme }) => ss.Body(theme)};

  color: ${({ theme }) => theme.colors.muted};

  text-align: center;
`;
