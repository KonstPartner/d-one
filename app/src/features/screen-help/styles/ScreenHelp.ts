import styled from '@emotion/native';

import * as ss from '@shared/styles';

export const Root = styled.View`
  gap: ${({ theme }) => ss.px(theme.spacing.lg)};

  padding-bottom: ${({ theme }) => ss.px(theme.spacing.md)};
`;

export const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};
`;

export const Intro = styled.Text`
  color: ${({ theme }) => theme.colors.muted};
`;

export const Section = styled.View`
  gap: ${({ theme }) => ss.px(theme.spacing.sm)};

  padding-bottom: ${({ theme }) => ss.px(theme.spacing.lg)};

  border-bottom-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

export const SectionTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
`;

export const Paragraph = styled.Text`
  color: ${({ theme }) => theme.colors.text};
`;

export const Bullets = styled.View`
  gap: ${({ theme }) => ss.px(theme.spacing.xs)};
`;

export const BulletRow = styled.View`
  flex-direction: row;

  align-items: flex-start;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const BulletMark = styled.Text`
  color: ${({ theme }) => theme.colors.primary};

  font-weight: ${({ theme }) => theme.weight.bold};
`;

export const BulletText = styled.Text`
  flex: 1;

  color: ${({ theme }) => theme.colors.text};
`;
