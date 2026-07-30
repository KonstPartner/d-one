import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { css } from '@emotion/native';
import { Theme } from '@emotion/react';

import { SelectDropdownTone } from '@features/shared/model';
import { toPX } from '@features/theme/model';

export const getToneColor = (theme: Theme, tone: SelectDropdownTone) => {
  if (tone === 'success') {
    return theme.colors.success;
  }

  if (tone === 'warning') {
    return theme.colors.warning;
  }

  if (tone === 'danger') {
    return theme.colors.danger;
  }

  return theme.colors.primary;
};

const getToneSoftBackground = (theme: Theme, tone: SelectDropdownTone) => {
  if (tone === 'success') {
    return theme.colors.shades.success.sm;
  }

  if (tone === 'warning') {
    return theme.colors.shades.warning.sm;
  }

  if (tone === 'danger') {
    return theme.colors.shades.danger.sm;
  }

  return theme.colors.shades.primary.sm;
};

export const Container = (opened: boolean) =>
  css`
    position: relative;
    gap: 6px;
    z-index: ${opened ? 10000 : 1};
    elevation: ${opened ? 30 : 1};
  ` as StyleProp<ViewStyle>;

export const Field = (theme: Theme, opened: boolean) =>
  css`
    min-height: 46px;
    padding: 11px 12px;
    border-radius: ${toPX(theme.radius.md)};
    border-width: ${toPX(theme.border.width.sm)};
    border-color: ${opened ? theme.colors.primary : theme.colors.border};
    background-color: ${theme.colors.input};
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  ` as StyleProp<ViewStyle>;

export const FieldContent = css`
  flex: 1;
  flex-direction: row;
  align-items: center;
  gap: 8px;
` as StyleProp<ViewStyle>;

export const FieldText = (theme: Theme, hasValue: boolean) =>
  css`
    flex: 1;
    color: ${hasValue ? theme.colors.text : theme.colors.muted};
    font-size: ${toPX(theme.size.base)};
  ` as StyleProp<TextStyle>;

export const Dropdown = (theme: Theme, hasLabel: boolean) =>
  css`
    position: absolute;
    top: ${hasLabel ? '74px' : '52px'};
    left: 0px;
    right: 0px;
    max-height: 230px;
    padding: 6px;
    border-radius: ${toPX(theme.radius.md)};
    border-width: ${toPX(theme.border.width.sm)};
    border-color: ${theme.colors.border};
    background-color: ${theme.colors.card};
    gap: 6px;
    z-index: 10000;
    elevation: 30;
  ` as StyleProp<ViewStyle>;

export const DropdownScrollContent = css`
  gap: 5px;
` as StyleProp<ViewStyle>;

export const Option = (theme: Theme, selected: boolean) =>
  css`
    min-height: 50px;
    padding: 7px 9px;
    border-radius: ${toPX(theme.radius.md)};
    border-width: ${selected ? '2px' : '1px'};
    border-color: ${selected ? theme.colors.primary : theme.colors.border};
    background-color: ${theme.colors.card};
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  ` as StyleProp<ViewStyle>;

export const OptionContent = css`
  flex: 1;
  flex-direction: row;
  align-items: center;
  gap: 10px;
` as StyleProp<ViewStyle>;

export const IconBox = (
  theme: Theme,
  tone: SelectDropdownTone,
  selected: boolean
) =>
  css`
    width: 34px;
    height: 34px;
    border-radius: ${toPX(theme.radius.full)};
    align-items: center;
    justify-content: center;
    background-color: ${selected
      ? getToneColor(theme, tone)
      : getToneSoftBackground(theme, tone)};
  ` as StyleProp<ViewStyle>;

export const OptionText = (theme: Theme, selected: boolean) =>
  css`
    flex: 1;
    color: ${selected ? theme.colors.primary : theme.colors.text};
    font-size: ${toPX(theme.size.base)};
    font-weight: ${selected ? theme.weight.semibold : theme.weight.medium};
  ` as StyleProp<TextStyle>;
