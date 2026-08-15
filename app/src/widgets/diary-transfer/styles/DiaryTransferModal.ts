import styled from '@emotion/native';
import type { PressableStateCallbackType, ViewStyle } from 'react-native';

import * as ss from '@shared/styles';

type HeaderSideProps = {
  $align?: 'start' | 'end';
};

type OptionButtonProps = {
  $disabled: boolean;
};

export const Root = styled.View`
  width: 100%;
  flex: 1;
`;

export const Screen = styled.View`
  width: 100%;
  flex: 1;

  gap: ${({ theme }) => ss.px(theme.spacing.lg)};
`;

export const Header = styled.View`
  width: 100%;

  flex-direction: row;
  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.md)};
`;

export const HeaderSide = styled.View<HeaderSideProps>`
  width: ${({ theme }) => ss.px(theme.control.height.md)};

  align-items: ${({ $align }) =>
    $align === 'end' ? 'flex-end' : 'flex-start'};
`;

export const Title = styled.Text`
  flex: 1;

  color: ${({ theme }) => theme.colors.text};

  text-align: center;
`;

export const Options = styled.View`
  width: 100%;

  gap: ${({ theme }) => ss.px(theme.spacing.md)};
`;

export const OptionButton = styled.Pressable<OptionButtonProps>`
  width: 100%;

  min-height: ${({ theme }) =>
    ss.px(theme.control.height.lg + theme.spacing.md)};

  flex-direction: row;
  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.md)};

  padding: ${({ theme }) => ss.px(theme.spacing.lg)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};

  border-color: ${({ theme }) => theme.colors.border};

  border-radius: ${({ theme }) => ss.px(theme.radius.lg)};

  background-color: ${({ theme }) => theme.colors.card};

  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
`;

export const OptionIcon = styled.View`
  width: ${({ theme }) => ss.px(theme.control.height.md)};
  height: ${({ theme }) => ss.px(theme.control.height.md)};

  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme }) => theme.colors.bg};
`;

export const OptionContent = styled.View`
  flex: 1;

  gap: ${({ theme }) => ss.px(theme.spacing.xs)};
`;

export const OptionTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => ss.px(theme.size.md)};
  font-weight: ${({ theme }) => theme.weight.bold};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.lg)};
`;

export const OptionDescription = styled.Text`
  color: ${({ theme }) => theme.colors.muted};

  font-size: ${({ theme }) => ss.px(theme.size.sm)};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.sm)};
`;

export const getOptionButtonStyle = ({
  pressed,
}: PressableStateCallbackType): ViewStyle => ({
  opacity: pressed ? 0.7 : 1,
});
