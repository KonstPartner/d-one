import styled from '@emotion/native';

import * as ss from '@shared/styles';

type FieldSelectorProps = {
  $opened: boolean;
};

type OptionProps = {
  $selected: boolean;
};

export const Root = styled.View`
  position: relative;

  z-index: 20;

  width: 100%;

  min-width: 0;
`;

export const TopRow = styled.View`
  width: 100%;

  flex-direction: row;
  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const InputShell = styled.View`
  min-height: ${({ theme }) => ss.px(theme.control.height.lg)};

  flex: 1;

  min-width: 0;

  flex-direction: row;
  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};

  padding-horizontal: ${({ theme }) => ss.px(theme.spacing.md)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};

  border-color: ${({ theme }) => theme.colors.border};

  border-radius: ${({ theme }) => ss.px(theme.radius.lg)};

  background-color: ${({ theme }) => theme.colors.input};
`;

export const Input = styled.TextInput`
  min-height: ${({ theme }) => ss.px(theme.control.height.lg)};

  flex: 1;

  min-width: 0;

  padding-vertical: 0;

  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => ss.px(theme.size.md)};
`;

export const ClearButton = styled.Pressable`
  width: ${({ theme }) => ss.px(theme.control.height.sm)};

  height: ${({ theme }) => ss.px(theme.control.height.sm)};

  align-items: center;
  justify-content: center;
`;

export const EndActions = styled.View`
  flex-direction: row;
  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const FieldSelector = styled.Pressable<FieldSelectorProps>`
  min-height: ${({ theme }) => ss.px(theme.control.height.lg)};

  flex-direction: row;

  align-items: center;
  justify-content: space-between;

  gap: ${({ theme }) => ss.px(theme.spacing.xs)};

  margin-top: ${({ theme }) => ss.px(theme.spacing.xs)};

  padding-horizontal: ${({ theme }) => ss.px(theme.spacing.sm)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};

  border-color: ${({ theme, $opened }) =>
    $opened ? theme.colors.primary : theme.colors.border};

  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme }) => theme.colors.input};
`;

export const FieldSelectorText = styled.Text`
  ${({ theme }) => ss.Body(theme)};

  flex: 1;

  color: ${({ theme }) => theme.colors.muted};

  font-weight: ${({ theme }) => theme.weight.bold};
`;

export const Options = styled.View`
  ${({ theme }) => ss.Surface(theme, 'card')};

  ${({ theme }) => ss.Rounded(theme, 'md')};

  ${({ theme }) => ss.Shadow(theme, 'soft')};

  position: absolute;

  z-index: 50;

  top: ${({ theme }) =>
    ss.px(
      theme.control.height.lg + theme.spacing.xs + theme.control.height.lg
    )};

  left: 0;
  right: 0;

  padding: ${({ theme }) => ss.px(theme.spacing.xs)};
`;

export const Option = styled.Pressable<OptionProps>`
  min-height: ${({ theme }) => ss.px(theme.control.height.lg)};

  flex-direction: row;

  align-items: center;
  justify-content: space-between;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};

  padding-horizontal: ${({ theme }) => ss.px(theme.spacing.sm)};

  border-radius: ${({ theme }) => ss.px(theme.radius.sm)};

  background-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.shades.primary.sm : theme.colors.card};
`;

export const OptionText = styled.Text<OptionProps>`
  ${({ theme }) => ss.Body(theme)};

  color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary : theme.colors.text};

  font-weight: ${({ theme, $selected }) =>
    $selected ? theme.weight.bold : theme.weight.regular};
`;
