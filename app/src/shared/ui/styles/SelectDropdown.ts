import styled, { css } from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { TextStyle, ViewStyle } from 'react-native';

import * as ss from '@shared/styles';

import type { SelectDropdownTone } from '../SelectDropdown.types';

type OpenedProps = {
  $opened: boolean;
};

type FieldTextProps = {
  $hasValue: boolean;
};

type DropdownProps = {
  $hasLabel: boolean;
  $inlineOptions: boolean;
};

type SelectedProps = {
  $selected: boolean;
};

type IconBoxProps = SelectedProps & {
  $tone: SelectDropdownTone;
};

export const getToneColor = (
  theme: Theme,
  tone: SelectDropdownTone
): string => {
  switch (tone) {
    case 'success':
      return theme.colors.success;

    case 'warning':
      return theme.colors.warning;

    case 'danger':
      return theme.colors.danger;

    default:
      return theme.colors.primary;
  }
};

const getToneSoftBackground = (
  theme: Theme,
  tone: SelectDropdownTone
): string => {
  switch (tone) {
    case 'success':
      return theme.colors.shades.success.sm;

    case 'warning':
      return theme.colors.shades.warning.sm;

    case 'danger':
      return theme.colors.shades.danger.sm;

    default:
      return theme.colors.shades.primary.sm;
  }
};

export const getIconGlyphStyle = (size: number): TextStyle => ({
  width: size,

  height: size,

  lineHeight: size,

  textAlign: 'center',

  textAlignVertical: 'center',

  includeFontPadding: false,
});

const getDropdownPosition = (hasLabel: boolean, inlineOptions: boolean) => {
  if (inlineOptions) {
    return css`
      position: relative;

      max-height: 230px;
    ` as ViewStyle;
  }

  return css`
    position: absolute;

    top: ${ss.px(hasLabel ? 74 : 52)};

    left: 0;
    right: 0;

    max-height: 230px;
  ` as ViewStyle;
};

export const Root = styled.View<OpenedProps>`
  position: relative;
  background: ${({ theme }) => theme.colors.input};
  border-radius: ${({ theme }) => ss.px(theme.radius.md)};
  border-width: 1px;
  border-style: solid;
  border-color: ${({ theme }) => theme.colors.border};
  gap: 6px;
  padding: 6px;
  z-index: ${({ $opened }) => ($opened ? 10000 : 1)};

  elevation: ${({ $opened }) => ($opened ? 30 : 1)};
`;

export const Label = styled.Text`
  ${({ theme }) => ss.Text(theme, 'md', 'semibold', 'muted', 'lg')};
`;

export const Field = styled.Pressable<OpenedProps>`
  ${({ theme }) => ss.Rounded(theme, 'md')};

  min-height: 46px;

  flex-direction: row;

  align-items: center;
  justify-content: space-between;

  gap: 10px;

  border-color: ${({ theme, $opened }) =>
    $opened ? theme.colors.primary : theme.colors.border};
`;

export const FieldContent = styled.View`
  flex: 1;
  min-width: 0;

  flex-direction: row;
  align-items: center;

  gap: 10px;
`;

export const FieldText = styled.Text<FieldTextProps>`
  ${({ theme, $hasValue }) =>
    ss.Text(theme, 'base', 'regular', $hasValue ? 'default' : 'muted', 'md')};

  flex: 1;
  min-width: 0;

  include-font-padding: false;
`;

export const Dropdown = styled.View<DropdownProps>`
  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};

  border-color: ${({ theme }) => theme.colors.border};

  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme }) => theme.colors.input};

  ${({ $hasLabel, $inlineOptions }) =>
    getDropdownPosition($hasLabel, $inlineOptions)};

  padding: ${({ theme }) => ss.px(theme.spacing.xs)};
`;

export const OptionContent = styled.View`
  flex: 1;
  min-width: 0;

  flex-direction: row;
  align-items: center;

  gap: 10px;
`;

export const CustomOptionContent = styled.View`
  width: 100%;
`;

export const IconBox = styled.View<IconBoxProps>`
  width: 34px;
  height: 34px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: ${({ theme }) => ss.px(theme.radius.full)};

  background-color: ${({ theme, $tone, $selected }) =>
    $selected
      ? getToneColor(theme, $tone)
      : getToneSoftBackground(theme, $tone)};
`;
export const Option = styled.Pressable<SelectedProps>`
  min-height: 50px;

  flex-direction: row;

  align-items: center;
  justify-content: space-between;

  gap: 10px;

  padding: 7px 9px;

  border-width: ${({ theme, $selected }) =>
    ss.px($selected ? theme.border.width.md : theme.border.width.sm)};

  border-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary : theme.colors.border};

  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.shades.primary.sm : theme.colors.card};
`;

export const IconPlaceholder = styled.View`
  width: 34px;
  height: 34px;

  flex-shrink: 0;
`;

export const ControlIcon = styled.View`
  width: 20px;
  height: 20px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;
`;

export const OptionText = styled.Text<SelectedProps>`
  ${({ theme, $selected }) =>
    ss.Text(
      theme,
      'base',
      $selected ? 'semibold' : 'medium',
      $selected ? 'primary' : 'default',
      'md'
    )};

  flex: 1;
  min-width: 0;

  include-font-padding: false;
`;

export const dropdownContent = css`
  gap: 5px;
` as ViewStyle;
