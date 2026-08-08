import styled from '@emotion/native';

import { Button } from '../Button';

export type ConfirmDialogTone = 'primary' | 'danger';

const getConfirmBackground = (
  theme: ReactNativePaper.Theme | any,
  tone: ConfirmDialogTone,
  disabled: boolean
): string => {
  if (tone === 'danger') {
    return disabled ? theme.colors.shades.danger.md : theme.colors.danger;
  }

  return disabled ? theme.colors.shades.primary.md : theme.colors.primary;
};

const getConfirmTextColor = (
  theme: ReactNativePaper.Theme | any,
  tone: ConfirmDialogTone,
  disabled: boolean
): string => {
  if (!disabled) {
    return theme.colors.white;
  }

  return tone === 'danger'
    ? theme.colors.shades.danger.text
    : theme.colors.shades.primary.text;
};

export const Backdrop = styled.Pressable`
  flex: 1;

  align-items: center;
  justify-content: center;

  padding: ${({ theme }) => theme.spacing.lg}px;

  background-color: rgba(0, 0, 0, 0.5);
`;

export const Card = styled.Pressable`
  width: 100%;
  max-width: 500px;

  gap: ${({ theme }) => theme.spacing.md}px;

  padding: ${({ theme }) => theme.spacing.lg}px;

  border-width: ${({ theme }) => theme.border.width.sm}px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md}px;

  background-color: ${({ theme }) => theme.colors.bg};
`;

export const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => theme.size.lg}px;
  font-weight: ${({ theme }) => theme.weight.bold};
  line-height: ${({ theme }) => theme.lineHeight.xl}px;
`;

export const Description = styled.Text`
  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => theme.size.base}px;
  font-weight: ${({ theme }) => theme.weight.regular};
  line-height: ${({ theme }) => theme.lineHeight.md}px;
`;

export const Actions = styled.View`
  flex-direction: row;

  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const ConfirmButton = styled(Button)<{
  $tone: ConfirmDialogTone;
  $disabled: boolean;
}>`
  flex: 1;

  min-height: ${({ theme }) => theme.control.height.md}px;

  border-radius: ${({ theme }) => theme.radius.md}px;

  padding: ${({ theme }) => theme.spacing.md}px
    ${({ theme }) => theme.spacing.lg}px;

  background-color: ${({ theme, $tone, $disabled }) =>
    getConfirmBackground(theme, $tone, $disabled)};
`;

export const ConfirmButtonText = styled.Text<{
  $tone: ConfirmDialogTone;
  $disabled: boolean;
}>`
  color: ${({ theme, $tone, $disabled }) =>
    getConfirmTextColor(theme, $tone, $disabled)};

  font-size: ${({ theme }) => theme.size.md}px;
  font-weight: ${({ theme }) => theme.weight.bold};
  line-height: ${({ theme }) => theme.lineHeight.md}px;

  text-align: center;
`;

export const CancelButton = styled(Button)`
  flex: 1;

  min-height: ${({ theme }) => theme.control.height.md}px;

  border-width: ${({ theme }) => theme.border.width.sm}px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md}px;

  padding: ${({ theme }) => theme.spacing.md}px
    ${({ theme }) => theme.spacing.lg}px;

  background-color: ${({ theme }) => theme.colors.input};
`;

export const CancelButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => theme.size.md}px;
  font-weight: ${({ theme }) => theme.weight.bold};
  line-height: ${({ theme }) => theme.lineHeight.md}px;

  text-align: center;
`;
