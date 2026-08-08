import styled, { css } from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { ViewStyle } from 'react-native';

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

const getDropdownPosition = (hasLabel: boolean, inlineOptions: boolean) => {
  if (inlineOptions) {
    return css`
      position: relative;
      max-height: 230px;
    ` as ViewStyle;
  }

  return css`
    position: absolute;

    top: ${hasLabel ? 74 : 52}px;
    left: 0;
    right: 0;

    max-height: 230px;
  ` as ViewStyle;
};

export const Root = styled.View<OpenedProps>`
  position: relative;

  gap: 6px;

  z-index: ${({ $opened }) => ($opened ? 10000 : 1)};

  elevation: ${({ $opened }) => ($opened ? 30 : 1)};
`;

export const Label = styled.Text`
  ${({ theme }) => ss.Text(theme, 'md', 'semibold', 'muted', 'lg')};
`;

export const Field = styled.Pressable<OpenedProps>`
  ${({ theme }) => ss.Surface(theme, 'input')};

  ${({ theme }) => ss.Rounded(theme, 'md')};

  min-height: 46px;

  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  gap: 10px;

  padding: 11px 12px;

  border-color: ${({ theme, $opened }) =>
    $opened ? theme.colors.primary : theme.colors.border};
`;

export const FieldContent = styled.View`
  flex: 1;

  flex-direction: row;
  align-items: center;

  gap: 8px;
`;

export const FieldText = styled.Text<FieldTextProps>`
  ${({ theme, $hasValue }) =>
    ss.Text(theme, 'base', 'regular', $hasValue ? 'default' : 'muted', 'md')};

  flex: 1;
`;

export const Dropdown = styled.View<DropdownProps>`
  ${({ theme }) => ss.Surface(theme)};

  ${({ theme }) => ss.Rounded(theme, 'md')};

  ${ss.PrimeLayer};

  ${({ $hasLabel, $inlineOptions }) =>
    getDropdownPosition($hasLabel, $inlineOptions)};

  padding: 6px;
`;

export const Option = styled.Pressable<SelectedProps>`
  ${({ theme }) => ss.Surface(theme)};

  ${({ theme }) => ss.Rounded(theme, 'md')};

  min-height: 50px;

  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  gap: 10px;

  padding: 7px 9px;

  border-width: ${({ theme, $selected }) =>
    $selected ? theme.border.width.md : theme.border.width.sm}px;

  border-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary : theme.colors.border};
`;

export const OptionContent = styled.View`
  flex: 1;

  flex-direction: row;
  align-items: center;

  gap: 10px;
`;

export const IconBox = styled.View<IconBoxProps>`
  ${ss.CenterContent};

  ${({ theme }) => ss.Rounded(theme, 'full')};

  width: 34px;
  height: 34px;

  background-color: ${({ theme, $tone, $selected }) =>
    $selected
      ? getToneColor(theme, $tone)
      : getToneSoftBackground(theme, $tone)};
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
`;

export const dropdownContent = css`
  gap: 5px;
` as ViewStyle;
