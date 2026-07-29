import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { css } from '@emotion/native';
import type { Theme } from '@emotion/react';

import { toPX } from '@features/theme/model';

export const Content = (theme: Theme) =>
  css`
    width: 100%;
    max-width: 560px;
    align-self: center;
    gap: ${toPX(theme.spacing.lg)};
    padding: ${toPX(theme.spacing.md)};
    padding-bottom: ${toPX(theme.spacing.xl)};
  ` as StyleProp<ViewStyle>;

export const ProfileCard = (theme: Theme) =>
  css`
    width: 100%;
    overflow: hidden;
    border-width: ${toPX(theme.border.width.sm)};
    border-color: ${theme.colors.border};
    border-radius: ${toPX(theme.radius.lg)};
    background-color: ${theme.colors.card};
  ` as StyleProp<ViewStyle>;

export const ProfileRow = (theme: Theme) =>
  css`
    width: 100%;
    min-height: ${toPX(theme.control.height.lg + theme.spacing.sm)};
    flex-direction: row;
    align-items: center;
    padding-horizontal: ${toPX(theme.spacing.lg)};
    padding-vertical: ${toPX(theme.spacing.sm)};
  ` as StyleProp<ViewStyle>;

export const ProfileLabel = (theme: Theme) =>
  css`
    width: 32%;
    padding-right: ${toPX(theme.spacing.md)};
    color: ${theme.colors.muted};
    font-size: ${toPX(theme.size.base)};
    font-weight: ${theme.weight.regular};
    line-height: ${toPX(theme.lineHeight.md)};
  ` as StyleProp<TextStyle>;

export const ProfileValue = (theme: Theme) =>
  css`
    flex: 1;
    color: ${theme.colors.text};
    font-size: ${toPX(theme.size.md)};
    font-weight: ${theme.weight.bold};
    line-height: ${toPX(theme.lineHeight.lg)};
  ` as StyleProp<TextStyle>;

export const Separator = (theme: Theme) =>
  css`
    width: 100%;
    height: ${toPX(theme.border.width.sm)};
    background-color: ${theme.colors.border};
  ` as StyleProp<ViewStyle>;

export const RoleValue = css`
  flex: 1;
  align-items: flex-start;
  justify-content: center;
` as StyleProp<ViewStyle>;

export const RoleBadge = (theme: Theme, hasGrantedRole: boolean) =>
  css`
    padding-horizontal: ${toPX(theme.spacing.md)};
    padding-vertical: ${toPX(theme.spacing.sm)};
    border-radius: ${toPX(theme.radius.full)};
    background-color: ${hasGrantedRole
      ? theme.colors.shades.primary.md
      : theme.colors.shades.warning.md};
  ` as StyleProp<ViewStyle>;

export const RoleBadgeText = (theme: Theme, hasGrantedRole: boolean) =>
  css`
    color: ${hasGrantedRole
      ? theme.colors.shades.primary.text
      : theme.colors.shades.warning.text};
    font-size: ${toPX(theme.size.sm)};
    font-weight: ${theme.weight.bold};
    line-height: ${toPX(theme.lineHeight.sm)};
  ` as StyleProp<TextStyle>;

export const Actions = (theme: Theme) =>
  css`
    width: 100%;
    gap: ${toPX(theme.spacing.md)};
  ` as StyleProp<ViewStyle>;

export const ActionButton = (theme: Theme, pressed: boolean) =>
  css`
    width: 100%;
    min-height: ${toPX(theme.control.height.lg)};
    align-items: center;
    justify-content: center;
    padding-horizontal: ${toPX(theme.spacing.lg)};
    border-width: ${toPX(theme.border.width.sm)};
    border-color: ${theme.colors.border};
    border-radius: ${toPX(theme.radius.lg)};
    background-color: ${theme.colors.card};
    opacity: ${pressed ? 0.7 : 1};
  ` as StyleProp<ViewStyle>;

export const ActionContent = (theme: Theme) =>
  css`
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: ${toPX(theme.spacing.md)};
  ` as StyleProp<ViewStyle>;

export const ActionText = (theme: Theme) =>
  css`
    color: ${theme.colors.text};
    font-size: ${toPX(theme.size.md)};
    font-weight: ${theme.weight.bold};
    line-height: ${toPX(theme.lineHeight.lg)};
  ` as StyleProp<TextStyle>;

export const LogoutButton = (
  theme: Theme,
  pressed: boolean,
  disabled: boolean
) =>
  css`
    align-self: center;
    padding-horizontal: ${toPX(theme.spacing.xl)};
    padding-vertical: ${toPX(theme.spacing.sm)};
    opacity: ${pressed || disabled ? 0.55 : 1};
  ` as StyleProp<ViewStyle>;

export const LogoutText = (theme: Theme) =>
  css`
    color: ${theme.colors.danger};
    font-size: ${toPX(theme.size.md)};
    font-weight: ${theme.weight.bold};
    line-height: ${toPX(theme.lineHeight.lg)};
    text-align: center;
  ` as StyleProp<TextStyle>;
