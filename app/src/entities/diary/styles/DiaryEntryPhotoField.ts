import styled from '@emotion/native';
import type { ImageStyle, ViewStyle } from 'react-native';

import * as ss from '@shared/styles';

type DisabledProps = {
  $disabled: boolean;
};

export const Root = styled.View<DisabledProps>`
  min-width: 0;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};

  padding: ${({ theme }) => ss.px(theme.spacing.sm)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};

  border-color: ${({ theme }) => theme.colors.border};

  border-radius: ${({ theme }) => ss.px(theme.radius.lg)};

  background-color: ${({ theme }) => theme.colors.card};

  opacity: ${({ $disabled }) => ($disabled ? 0.55 : 1)};
`;

export const Title = styled.Text`
  ${({ theme }) => ss.Subheading(theme)};
`;

export const Preview = styled.View`
  position: relative;

  width: 100%;

  aspect-ratio: 1.7777778;

  overflow: hidden;

  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme }) => theme.colors.bg};
`;

export const imageStyle: ImageStyle = {
  width: '100%',
  height: '100%',
};

export const EmptyState = styled.View`
  flex: 1;

  align-items: center;
  justify-content: center;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};

  padding: ${({ theme }) => ss.px(theme.spacing.md)};
`;

export const EmptyText = styled.Text`
  ${({ theme }) => ss.Caption(theme)};

  color: ${({ theme }) => theme.colors.muted};

  text-align: center;
`;

export const LoadingOverlay = styled.View`
  position: absolute;

  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  align-items: center;
  justify-content: center;

  background-color: ${({ theme }) => theme.colors.card};
`;

export const Actions = styled.View`
  flex-direction: row;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const actionStyle: ViewStyle = {
  flex: 1,
};

export const ButtonContent = styled.View`
  flex-direction: row;

  align-items: center;
  justify-content: center;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const SecondaryButtonText = styled.Text<DisabledProps>`
  color: ${({ theme, $disabled }) =>
    $disabled ? theme.colors.muted : theme.colors.text};

  font-size: ${({ theme }) => ss.px(theme.size.sm)};

  font-weight: ${({ theme }) => theme.weight.semibold};
`;

export const DangerButtonText = styled.Text<DisabledProps>`
  color: ${({ theme, $disabled }) =>
    $disabled ? theme.colors.muted : theme.colors.white};

  font-size: ${({ theme }) => ss.px(theme.size.sm)};

  font-weight: ${({ theme }) => theme.weight.semibold};
`;
