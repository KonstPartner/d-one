import styled from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { TextStyle, ViewStyle } from 'react-native';

export const Trigger = styled.Pressable`
  height: 44px;

  justify-content: center;

  padding-horizontal: 12px;
`;

export const MenuContainer = styled.View`
  width: 220px;

  overflow: hidden;

  border-radius: ${({ theme }) => theme.radius.md}px;

  background-color: ${({ theme }) => theme.colors.bg};
`;

export const MenuRow = styled.Pressable`
  height: 44px;

  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  padding-horizontal: 12px;
`;

export const MenuItemContent = styled.View`
  flex-direction: row;
  align-items: center;

  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const MenuText = styled.Text`
  font-size: ${({ theme }) => theme.size.base}px;
`;

export const getMenuRowStyle = (
  theme: Theme,
  options: {
    pressed: boolean;
    isLast: boolean;
    disabled: boolean;
  }
): ViewStyle => ({
  opacity: options.disabled ? 0.5 : 1,

  backgroundColor: options.pressed ? theme.colors.card : theme.colors.bg,

  borderBottomWidth: options.isLast ? 0 : theme.border.width.sm,

  borderBottomColor: theme.colors.border,
});

export const getMenuTextStyle = (
  theme: Theme,
  options: {
    destructive: boolean;
    disabled: boolean;
  }
): TextStyle => ({
  color: options.destructive
    ? theme.colors.danger
    : options.disabled
      ? theme.colors.muted
      : theme.colors.text,
});
