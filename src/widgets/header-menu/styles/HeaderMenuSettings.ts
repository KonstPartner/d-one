import styled from '@emotion/native';

import * as ss from '@shared/styles';

export const Scroll = styled.ScrollView`
  flex: 1;
`;

export const Content = styled.View`
  gap: ${({ theme }) => ss.px(theme.spacing.md)};

  padding-top: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => ss.px(theme.size.lg)};

  font-weight: ${({ theme }) => theme.weight.bold};

  line-height: ${({ theme }) => ss.px(theme.lineHeight.xl)};
`;

export const SectionTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => ss.px(theme.size.md)};

  font-weight: ${({ theme }) => theme.weight.semibold};

  line-height: ${({ theme }) => ss.px(theme.lineHeight.lg)};
`;

export const Subtitle = styled.Text`
  color: ${({ theme }) => theme.colors.muted};

  font-size: ${({ theme }) => ss.px(theme.size.sm)};

  font-weight: ${({ theme }) => theme.weight.regular};

  line-height: ${({ theme }) => ss.px(theme.lineHeight.sm)};
`;
