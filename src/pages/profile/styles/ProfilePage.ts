import styled from '@emotion/native';
import type { Theme } from '@emotion/react';
import type {
  PressableStateCallbackType,
  TextStyle,
  ViewStyle,
} from 'react-native';

export const Content = styled.View`
  width: 100%;
  max-width: 560px;

  align-self: center;

  gap: ${({ theme }) => theme.spacing.lg}px;

  padding: ${({ theme }) => theme.spacing.md}px;
  padding-bottom: ${({ theme }) => theme.spacing.xl}px;
`;

export const ProfileCard = styled.View`
  width: 100%;

  overflow: hidden;

  border-width: ${({ theme }) => theme.border.width.sm}px;

  border-color: ${({ theme }) => theme.colors.border};

  border-radius: ${({ theme }) => theme.radius.lg}px;

  background-color: ${({ theme }) => theme.colors.card};
`;

export const ProfileRow = styled.View`
  width: 100%;

  min-height: ${({ theme }) => theme.control.height.lg + theme.spacing.sm}px;

  flex-direction: row;
  align-items: center;

  padding-horizontal: ${({ theme }) => theme.spacing.lg}px;

  padding-vertical: ${({ theme }) => theme.spacing.sm}px;
`;

export const ProfileLabel = styled.Text`
  width: 32%;

  padding-right: ${({ theme }) => theme.spacing.md}px;

  color: ${({ theme }) => theme.colors.muted};

  font-size: ${({ theme }) => theme.size.base}px;

  font-weight: ${({ theme }) => theme.weight.regular};

  line-height: ${({ theme }) => theme.lineHeight.md}px;
`;

export const ProfileValue = styled.Text`
  flex: 1;

  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => theme.size.md}px;

  font-weight: ${({ theme }) => theme.weight.bold};

  line-height: ${({ theme }) => theme.lineHeight.lg}px;
`;

export const Separator = styled.View`
  width: 100%;

  height: ${({ theme }) => theme.border.width.sm}px;

  background-color: ${({ theme }) => theme.colors.border};
`;

export const RoleValue = styled.View`
  flex: 1;

  align-items: flex-start;
  justify-content: center;
`;

export const RoleBadge = styled.View`
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;

  padding-vertical: ${({ theme }) => theme.spacing.sm}px;

  border-radius: ${({ theme }) => theme.radius.full}px;
`;

export const RoleBadgeText = styled.Text`
  font-size: ${({ theme }) => theme.size.sm}px;

  font-weight: ${({ theme }) => theme.weight.bold};

  line-height: ${({ theme }) => theme.lineHeight.sm}px;
`;

export const getRoleBadgeStyle = (
  theme: Theme,
  hasGrantedRole: boolean
): ViewStyle => ({
  backgroundColor: hasGrantedRole
    ? theme.colors.shades.primary.md
    : theme.colors.shades.warning.md,
});

export const getRoleBadgeTextStyle = (
  theme: Theme,
  hasGrantedRole: boolean
): TextStyle => ({
  color: hasGrantedRole
    ? theme.colors.shades.primary.text
    : theme.colors.shades.warning.text,
});

export const Actions = styled.View`
  width: 100%;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const ActionButton = styled.Pressable`
  width: 100%;

  min-height: ${({ theme }) => theme.control.height.lg}px;

  align-items: center;
  justify-content: center;

  padding-horizontal: ${({ theme }) => theme.spacing.lg}px;

  border-width: ${({ theme }) => theme.border.width.sm}px;

  border-color: ${({ theme }) => theme.colors.border};

  border-radius: ${({ theme }) => theme.radius.lg}px;

  background-color: ${({ theme }) => theme.colors.card};
`;

export const getActionButtonStyle = ({
  pressed,
}: PressableStateCallbackType): ViewStyle => ({
  opacity: pressed ? 0.7 : 1,
});

export const ActionContent = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;

  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const ActionText = styled.Text`
  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => theme.size.md}px;

  font-weight: ${({ theme }) => theme.weight.bold};

  line-height: ${({ theme }) => theme.lineHeight.lg}px;
`;
