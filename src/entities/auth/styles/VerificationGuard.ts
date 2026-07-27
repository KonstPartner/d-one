import { css } from '@emotion/native';
import { Theme } from '@emotion/react';

import { toPX } from '@features/theme/model';

export const ViewSpinnerStyle = css`
  flex: 1;
  justify-content: center;
  align-items: center;
` as any;

export const ViewStyle = css`
  position: relative;
  justify-content: center;
  align-items: center;
  gap: 10px;
` as any;

export const TextStyle = (theme: Theme) =>
  css`
    text-align: center;
    color: ${theme.colors.text};
    font-size: ${toPX(theme.size.base)};
  ` as any;

export const ButtonStyles = (theme: Theme) =>
  css`
    background-color: ${theme.colors.primary};
  ` as any;
