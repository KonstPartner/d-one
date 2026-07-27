import { css } from '@emotion/native';
import { Theme } from '@emotion/react';

export const SettingsContent = css`
  gap: 12px;
  padding-top: 8px;
` as any;

export const SettingsTitle = (theme: Theme) =>
  css`
    font-size: 18px;
    font-weight: 700;
    color: ${theme.colors.text};
  ` as any;

export const SettingsSubtitle = (theme: Theme) =>
  css`
    font-size: 13px;
    color: ${theme.colors.muted};
    line-height: 18px;
  ` as any;
