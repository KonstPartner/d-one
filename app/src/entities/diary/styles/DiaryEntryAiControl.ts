import styled from '@emotion/native';

import * as ss from '@shared/styles';

type DisabledProps = {
  $disabled: boolean;
};

export const Root = styled.View<DisabledProps>`
  min-width: 0;
  min-height: ${ss.px(54)};

  flex: 1;

  flex-direction: row;
  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};

  padding: ${({ theme }) => ss.px(theme.spacing.sm)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-color: ${({ theme }) => theme.colors.border};

  border-radius: ${({ theme }) => ss.px(theme.radius.lg)};

  background-color: ${({ theme }) => theme.colors.card};

  opacity: ${({ $disabled }) => ($disabled ? 0.55 : 1)};
`;

export const Icon = styled.View`
  width: ${ss.px(28)};
  height: ${ss.px(28)};

  flex-shrink: 0;

  align-items: center;
  justify-content: center;
`;

export const Title = styled.Text`
  flex: 1;

  min-width: 0;

  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => ss.px(theme.size.sm)};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.md)};

  font-weight: ${({ theme }) => theme.weight.semibold};
`;
