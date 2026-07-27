import { css } from '@emotion/native';
import { Theme } from '@emotion/react';

import { toPX } from '@features/theme/model';

export const Backdrop = css`
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
` as any;

export const Container = css`
  position: absolute;
  inset: 0;
  align-items: stretch;
  max-width: 500px;
  margin: 0 auto;
` as any;

export const SafeArea = css`
  flex: 1;
` as any;

export const Sheet = (theme: Theme, withoutPadding: boolean) =>
  css`
    flex: 1;
    width: 100%;
    height: 100%;
    background-color: ${theme.colors.bg};
    padding: ${withoutPadding ? 0 : toPX(theme.spacing.lg)};
  ` as any;

export const Scroll = css`
  flex: 1;
` as any;

export const ScrollContent = css`
  padding-bottom: 8px;
` as any;

export const Content = css`
  flex: 1;
` as any;

export const CloseButton = (theme: Theme, withoutPadding: boolean) =>
  css`
    margin-top: ${toPX(theme.spacing.lg)};
    margin: ${withoutPadding ? toPX(theme.spacing.lg) : 0};
  ` as any;
