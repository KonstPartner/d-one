import styled from '@emotion/native';

import { Button, Input } from '@shared/ui';

export const Form = styled.View`
  width: 100%;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => theme.size.lg}px;

  font-weight: ${({ theme }) => theme.weight.semibold};

  line-height: ${({ theme }) => theme.lineHeight.xl}px;
`;

export const Text = styled.Text`
  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => theme.size.base}px;

  font-weight: ${({ theme }) => theme.weight.regular};

  line-height: ${({ theme }) => theme.lineHeight.md}px;
`;

export const MutedText = styled.Text`
  color: ${({ theme }) => theme.colors.muted};

  font-size: ${({ theme }) => theme.size.base}px;

  font-weight: ${({ theme }) => theme.weight.regular};

  line-height: ${({ theme }) => theme.lineHeight.md}px;
`;

export const EmailInput = styled(Input)`
  width: 100%;
`;

export const ActionsRow = styled.View`
  width: 100%;

  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const ActionsStack = styled.View`
  width: 100%;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const PrimaryButton = styled(Button)`
  min-height: ${({ theme }) => theme.control.height.md}px;

  border-radius: ${({ theme }) => theme.radius.md}px;

  padding: ${({ theme }) => theme.spacing.md}px
    ${({ theme }) => theme.spacing.lg}px;

  background-color: ${({ theme, disabled }) =>
    disabled ? theme.colors.shades.primary.md : theme.colors.primary};

  color: ${({ theme, disabled }) =>
    disabled ? theme.colors.shades.primary.text : theme.colors.white};
`;

export const FlexiblePrimaryButton = styled(PrimaryButton)`
  flex: 1;
  flex-basis: 0px;
`;

export const SecondaryButton = styled(Button)`
  min-height: ${({ theme }) => theme.control.height.md}px;

  border-width: ${({ theme }) => theme.border.width.sm}px;

  border-color: ${({ theme }) => theme.colors.border};

  border-radius: ${({ theme }) => theme.radius.md}px;

  padding: ${({ theme }) => theme.spacing.md}px
    ${({ theme }) => theme.spacing.lg}px;

  background-color: ${({ theme }) => theme.colors.input};

  color: ${({ theme }) => theme.colors.text};

  opacity: ${({ disabled }) => (disabled ? 0.55 : 1)};
`;

export const FlexibleSecondaryButton = styled(SecondaryButton)`
  flex: 1;
  flex-basis: 0px;
`;

export const PrimaryButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.white};

  font-size: ${({ theme }) => theme.size.md}px;

  font-weight: ${({ theme }) => theme.weight.bold};

  line-height: ${({ theme }) => theme.lineHeight.md}px;

  text-align: center;
`;

export const SecondaryButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => theme.size.md}px;

  font-weight: ${({ theme }) => theme.weight.bold};

  line-height: ${({ theme }) => theme.lineHeight.md}px;

  text-align: center;
`;
