import styled from '@emotion/native';

import * as ss from '@shared/styles';

type DisabledProps = {
  $disabled: boolean;
};

export const Root = styled.View<DisabledProps>`
  min-width: 0;
  min-height: ${({ theme }) => ss.px(theme.control.height.md)};

  flex: 1;

  flex-direction: row;
  align-items: stretch;

  overflow: hidden;

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme }) => theme.colors.card};

  opacity: ${({ $disabled }) => ($disabled ? 0.55 : 1)};
`;

export const Action = styled.Pressable`
  min-width: 0;

  flex: 1;

  flex-direction: row;
  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.xs)};

  padding-vertical: ${({ theme }) => ss.px(theme.spacing.sm)};
  padding-left: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const Icon = styled.View`
  align-items: center;
  justify-content: center;
`;

export const Label = styled.Text`
  min-width: 0;

  flex: 1;

  ${({ theme }) => ss.Text(theme, 'base', 'semibold', 'default', 'md')};
`;

export const SwitchArea = styled.View`
  flex-shrink: 0;

  align-items: center;
  justify-content: center;
`;
