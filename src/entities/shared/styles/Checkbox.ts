import { css } from '@emotion/native';
import { Theme } from '@emotion/react';

export const ItemButton = css`
  padding: 6px 12px;
  border-radius: 10px;
` as any;

export const Checkbox = (theme: Theme) =>
  css`
    width: 30px;
    height: 30px;
    border-width: 2px;
    border-radius: 2px;
    border-color: ${theme.colors.border};

    justify-content: center;
    align-items: center;
  ` as any;

export const Checked = (theme: Theme) =>
  css`
    border-color: ${theme.colors.primary};
    background-color: ${theme.colors.primary};
  ` as any;

export const Unchecked = (theme: Theme) =>
  css`
    background-color: ${theme.colors.bg};
  ` as any;
