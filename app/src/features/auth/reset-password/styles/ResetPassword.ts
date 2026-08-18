import styled from '@emotion/native';

import * as ss from '@shared/styles';

export const Trigger = styled.Pressable`
  align-self: center;
`;

export const TriggerText = styled.Text`
  ${({ theme }) => ss.Text(theme, 'base', 'medium', 'primary')};
`;

export const Container = styled.View`
  ${({ theme }) => ss.Stack(theme, 'lg')};

  flex: 1;
  justify-content: center;
`;

export const Head = styled.View`
  ${({ theme }) => ss.Stack(theme, 'sm')};
`;

export const Title = styled.Text`
  ${({ theme }) => ss.Text(theme, 'xl', 'bold', 'default', '2xl')};
`;

export const Description = styled.Text`
  ${({ theme }) => ss.Text(theme, 'sm', 'regular', 'muted', 'md')};
`;

export const SubmitButtonText = styled.Text`
  ${({ theme }) => ss.Text(theme, 'base', 'regular', 'inverse')};
`;
