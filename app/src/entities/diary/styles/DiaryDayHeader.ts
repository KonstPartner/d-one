import styled from '@emotion/native';

import * as ss from '@shared/styles';

export const Root = styled.Pressable`
  ${({ theme }) => ss.Inset(theme, 'md')};

  flex-direction: row;

  align-items: center;
  justify-content: space-between;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const Main = styled.View`
  flex: 1;

  flex-direction: row;

  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const Title = styled.Text`
  flex: 1;

  ${({ theme }) => ss.Subheading(theme)};
`;

export const Count = styled.Text`
  ${({ theme }) => ss.Caption(theme)};
`;
