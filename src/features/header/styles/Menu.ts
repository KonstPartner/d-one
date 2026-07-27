import { css } from '@emotion/native';
import { Theme } from '@emotion/react';

export const Trigger = css`
  padding-horizontal: 12px;
  height: 44px;
  justify-content: center;
` as any;

export const Popover = (theme: Theme) =>
  css`
    background-color: ${theme.colors.bg};
    border-radius: 12px;
    overflow: hidden;
    width: 220px;
  ` as any;

export const MenuContainer = css`` as any;

export const MenuRow = css`
  height: 44px;
  padding-horizontal: 12px;
` as any;

export const MenuRowDynamic = (
  theme: Theme,
  params: { pressed: boolean; isLast: boolean; disabled?: boolean }
) =>
  css`
    opacity: ${params.disabled ? 0.5 : 1};
    background-color: ${params.pressed ? theme.colors.card : theme.colors.bg};
    border-bottom-width: ${params.isLast ? 0 : 1}px;
    border-bottom-color: ${theme.colors.border};
  ` as any;

export const MenuText = (theme: Theme, destructive?: boolean) =>
  css`
    color: ${destructive ? theme.colors.danger : theme.colors.text};
    font-size: 14px;
  ` as any;

export const Chevron = (theme: Theme) =>
  css`
    color: ${theme.colors.muted};
  ` as any;
