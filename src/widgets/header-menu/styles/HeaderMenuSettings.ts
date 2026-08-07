import styled from '@emotion/native';

export const Scroll = styled.ScrollView`
  flex: 1;
`;

export const Content = styled.View`
  gap: ${({ theme }) => theme.spacing.md}px;

  padding-top: ${({ theme }) => theme.spacing.sm}px;
`;

export const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => theme.size.lg}px;

  font-weight: ${({ theme }) => theme.weight.bold};

  line-height: ${({ theme }) => theme.lineHeight.xl}px;
`;

export const SectionTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => theme.size.md}px;

  font-weight: ${({ theme }) => theme.weight.semibold};

  line-height: ${({ theme }) => theme.lineHeight.lg}px;
`;

export const Subtitle = styled.Text`
  color: ${({ theme }) => theme.colors.muted};

  font-size: ${({ theme }) => theme.size.sm}px;

  font-weight: ${({ theme }) => theme.weight.regular};

  line-height: ${({ theme }) => theme.lineHeight.sm}px;
`;
