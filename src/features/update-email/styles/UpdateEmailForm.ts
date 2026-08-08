import styled from '@emotion/native';

import * as ss from '@shared/styles';
import { Button, Input } from '@shared/ui';

export const Form = styled.View`
  width: 100%;
  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const Title = styled.Text`
  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => ss.px(theme.size.lg)};

  font-weight: ${({ theme }) => theme.weight.semibold};

  line-height: ${({ theme }) => ss.px(theme.lineHeight.xl)};
`;

export const Text = styled.Text`
  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => ss.px(theme.size.base)};

  font-weight: ${({ theme }) => theme.weight.regular};

  line-height: ${({ theme }) => ss.px(theme.lineHeight.md)};
`;

export const MutedText = styled.Text`
  color: ${({ theme }) => theme.colors.muted};

  font-size: ${({ theme }) => ss.px(theme.size.base)};

  font-weight: ${({ theme }) => theme.weight.regular};

  line-height: ${({ theme }) => ss.px(theme.lineHeight.md)};
`;

export const EmailInput = styled(Input)`
  width: 100%;
`;

export const ActionsRow = styled.View`
  width: 100%;

  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const ActionsStack = styled.View`
  width: 100%;
  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const PrimaryButton = styled(Button)`
  min-height: ${({ theme }) => ss.px(theme.control.height.md)};

  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  padding: ${({ theme }) =>
    `${ss.px(theme.spacing.md)} ${ss.px(theme.spacing.lg)}`};

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
  min-height: ${({ theme }) => ss.px(theme.control.height.md)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};

  border-color: ${({ theme }) => theme.colors.border};

  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  padding: ${({ theme }) =>
    `${ss.px(theme.spacing.md)} ${ss.px(theme.spacing.lg)}`};

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

  font-size: ${({ theme }) => ss.px(theme.size.md)};

  font-weight: ${({ theme }) => theme.weight.bold};

  line-height: ${({ theme }) => ss.px(theme.lineHeight.md)};

  text-align: center;
`;

export const SecondaryButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => ss.px(theme.size.md)};

  font-weight: ${({ theme }) => theme.weight.bold};

  line-height: ${({ theme }) => ss.px(theme.lineHeight.md)};

  text-align: center;
`;
