import styled from '@emotion/native';
import { Image } from 'expo-image';

import * as ss from '@shared/styles';

export const Content = styled.View`
  gap: ${({ theme }) => ss.px(theme.spacing.lg)};

  padding-top: ${({ theme }) => ss.px(theme.spacing.lg)};
  padding-bottom: ${({ theme }) => ss.px(theme.spacing.lg)};
`;

export const SavedCard = styled.View`
  width: 100%;

  flex-direction: row;
  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.md)};

  padding: ${({ theme }) => ss.px(theme.spacing.md)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-color: ${({ theme }) => theme.colors.shades.success.lg};
  border-radius: ${({ theme }) => ss.px(theme.radius.lg)};

  background-color: ${({ theme }) => theme.colors.shades.success.sm};
`;

export const SavedIcon = styled.View`
  width: 52px;
  height: 52px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme }) => theme.colors.card};
`;

export const SavedContent = styled.View`
  flex: 1;

  min-width: 0;

  gap: ${({ theme }) => ss.px(theme.spacing.xs)};
`;

export const SavedTitle = styled.Text`
  ${({ theme }) => ss.Text(theme, 'lg', 'bold', 'success', 'xl')};
`;

export const StatusCard = styled.View`
  width: 100%;

  flex-direction: row;
  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.md)};

  padding: ${({ theme }) => ss.px(theme.spacing.md)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => ss.px(theme.radius.lg)};

  background-color: ${({ theme }) => theme.colors.card};

  ${({ theme }) => ss.Shadow(theme, 'soft')};
`;

export const PhotoFrame = styled.View`
  width: 96px;
  height: 96px;

  flex-shrink: 0;

  overflow: hidden;

  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme }) => theme.colors.input};
`;

export const Photo = styled(Image)`
  width: 100%;
  height: 100%;
`;

export const PhotoPlaceholder = styled.View`
  flex: 1;

  align-items: center;
  justify-content: center;
`;

export const StatusIconBox = styled.View`
  width: 64px;
  height: 64px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme }) => theme.colors.shades.primary.sm};
`;

export const StatusContent = styled.View`
  flex: 1;

  min-width: 0;

  gap: ${({ theme }) => ss.px(theme.spacing.xs)};
`;

export const StatusTitle = styled.Text`
  ${({ theme }) => ss.Text(theme, 'lg', 'bold', 'default', 'xl')};
`;

export const StatusDescription = styled.Text`
  ${({ theme }) => ss.Text(theme, 'sm', 'medium', 'muted', 'md')};
`;

export const LoaderBox = styled.View`
  width: 44px;
  height: 44px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme }) => theme.colors.shades.primary.sm};
`;

export const FooterText = styled.Text`
  ${({ theme }) => ss.Text(theme, 'sm', 'regular', 'muted', 'md')};

  padding-horizontal: ${({ theme }) => ss.px(theme.spacing.lg)};

  text-align: center;
`;
