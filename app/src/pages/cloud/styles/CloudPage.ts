import styled from '@emotion/native';

import * as ss from '@shared/styles';

export const UnsupportedContent = styled.View`
  flex: 1;

  align-items: center;
  justify-content: center;

  gap: ${({ theme }) => ss.px(theme.spacing.md)};

  padding: ${({ theme }) => ss.px(theme.spacing.xl)};
`;

export const UnsupportedTitle = styled.Text`
  text-align: center;
`;

export const UnsupportedDescription = styled.Text`
  color: ${({ theme }) => theme.colors.muted};

  text-align: center;
`;
