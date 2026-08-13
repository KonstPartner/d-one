import styled from '@emotion/native';

import * as ss from '@shared/styles';

type DisabledProps = {
  $disabled: boolean;
};

export const Root = styled.View`
  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const Controls = styled.View`
  flex-direction: row;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const Control = styled.Pressable`
  min-width: 0;

  min-height: ${({ theme }) => ss.px(theme.control.height.md)};

  flex: 1;

  flex-direction: row;

  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};

  padding-horizontal: ${({ theme }) => ss.px(theme.spacing.md)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-color: ${({ theme }) => theme.colors.border};

  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme }) => theme.colors.input};
`;

export const ControlText = styled.Text<DisabledProps>`
  flex: 1;

  color: ${({ theme, $disabled }) =>
    $disabled ? theme.colors.muted : theme.colors.text};

  font-size: ${({ theme }) => ss.px(theme.size.sm)};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.md)};

  font-weight: ${({ theme }) => theme.weight.medium};
`;
