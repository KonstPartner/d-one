import styled from '@emotion/native';
import type { Theme } from '@emotion/react';
import type {
  PressableStateCallbackType,
  TextStyle,
  ViewStyle,
} from 'react-native';

import * as ss from '@shared/styles';

export const Content = styled.View`
  width: 100%;

  align-self: center;

  gap: ${({ theme }) => ss.px(theme.spacing.lg)};

  padding-bottom: ${({ theme }) => ss.px(theme.spacing.xl)};
`;

export const ProfileCard = styled.View`
  width: 100%;

  overflow: hidden;

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};

  border-color: ${({ theme }) => theme.colors.border};

  border-radius: ${({ theme }) => ss.px(theme.radius.lg)};

  background-color: ${({ theme }) => theme.colors.card};
`;

export const ProfileRow = styled.View`
  width: 100%;

  min-height: ${({ theme }) =>
    ss.px(theme.control.height.lg + theme.spacing.sm)};

  flex-direction: row;
  align-items: center;

  padding-horizontal: ${({ theme }) => ss.px(theme.spacing.lg)};

  padding-vertical: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const ProfileLabel = styled.Text`
  width: 32%;

  padding-right: ${({ theme }) => ss.px(theme.spacing.md)};

  color: ${({ theme }) => theme.colors.muted};

  font-size: ${({ theme }) => ss.px(theme.size.base)};

  font-weight: ${({ theme }) => theme.weight.regular};

  line-height: ${({ theme }) => ss.px(theme.lineHeight.md)};
`;

export const ProfileValue = styled.Text`
  flex: 1;

  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => ss.px(theme.size.md)};

  font-weight: ${({ theme }) => theme.weight.bold};

  line-height: ${({ theme }) => ss.px(theme.lineHeight.lg)};
`;

export const Separator = styled.View`
  width: 100%;

  height: ${({ theme }) => ss.px(theme.border.width.sm)};

  background-color: ${({ theme }) => theme.colors.border};
`;

export const RoleValue = styled.View`
  flex: 1;

  align-items: flex-start;
  justify-content: center;
`;

export const RoleBadge = styled.View`
  padding-horizontal: ${({ theme }) => ss.px(theme.spacing.md)};

  padding-vertical: ${({ theme }) => ss.px(theme.spacing.sm)};

  border-radius: ${({ theme }) => ss.px(theme.radius.full)};
`;

export const RoleBadgeText = styled.Text`
  font-size: ${({ theme }) => ss.px(theme.size.sm)};

  font-weight: ${({ theme }) => theme.weight.bold};

  line-height: ${({ theme }) => ss.px(theme.lineHeight.sm)};
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
  gap: ${({ theme }) => ss.px(theme.spacing.md)};
`;

export const ActionButton = styled.Pressable`
  width: 100%;

  min-height: ${({ theme }) => ss.px(theme.control.height.lg)};

  align-items: center;
  justify-content: center;

  padding-horizontal: ${({ theme }) => ss.px(theme.spacing.lg)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};

  border-color: ${({ theme }) => theme.colors.border};

  border-radius: ${({ theme }) => ss.px(theme.radius.lg)};

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

  gap: ${({ theme }) => ss.px(theme.spacing.md)};
`;

export const ActionText = styled.Text`
  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => ss.px(theme.size.md)};

  font-weight: ${({ theme }) => theme.weight.bold};

  line-height: ${({ theme }) => ss.px(theme.lineHeight.lg)};
`;
