import styled from '@emotion/native';
import type { Theme } from '@emotion/react';

import * as ss from '@shared/styles';

export type ButtonTone = keyof Pick<
  Theme['colors'],
  'primary' | 'success' | 'warning' | 'muted' | 'danger' | 'card' | 'input'
>;

type RootProps = {
  $tone: ButtonTone;
};

const getLabelColor = (theme: Theme, tone: ButtonTone): string => {
  switch (tone) {
    case 'card':
    case 'input':
      return theme.colors.text;

    default:
      return theme.colors.white;
  }
};

export const Root = styled.Pressable<RootProps>`
  min-height: ${({ theme }) => ss.px(theme.control.height.md)};

  padding-top: ${({ theme }) => ss.px(theme.spacing.sm)};
  padding-bottom: ${({ theme }) => ss.px(theme.spacing.sm)};

  padding-left: ${({ theme }) => ss.px(theme.spacing.xl)};
  padding-right: ${({ theme }) => ss.px(theme.spacing.xl)};

  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-color: ${({ theme, $tone }) => theme.colors[$tone]};

  background-color: ${({ theme, $tone }) => theme.colors[$tone]};

  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`;

export const Label = styled.Text<RootProps>`
  color: ${({ theme, $tone }) => getLabelColor(theme, $tone)};

  font-size: ${({ theme }) => ss.px(theme.size.md)};

  font-weight: ${({ theme }) => theme.weight.bold};

  line-height: ${({ theme }) => ss.px(theme.lineHeight.lg)};

  text-align: center;
`;
