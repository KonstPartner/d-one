import styled from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { TextStyle, ViewStyle } from 'react-native';

import type { SelectDropdownTone } from '../SelectDropdown.types';

export const Root = styled.View`
  position: relative;

  gap: 6px;
`;

export const Label = styled.Text`
  color: ${({ theme }) => theme.colors.muted};

  font-size: ${({ theme }) => theme.size.md}px;
  font-weight: ${({ theme }) => theme.weight.semibold};
  line-height: ${({ theme }) => theme.lineHeight.lg}px;
`;

export const Field = styled.Pressable`
  min-height: 46px;

  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  gap: 10px;

  padding: 11px 12px;

  border-width: ${({ theme }) => theme.border.width.sm}px;
  border-radius: ${({ theme }) => theme.radius.md}px;

  background-color: ${({ theme }) => theme.colors.input};
`;

export const FieldContent = styled.View`
  flex: 1;

  flex-direction: row;
  align-items: center;

  gap: 8px;
`;

export const FieldText = styled.Text`
  flex: 1;

  font-size: ${({ theme }) => theme.size.base}px;
`;

export const Dropdown = styled.View`
  padding: 6px;

  border-width: ${({ theme }) => theme.border.width.sm}px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md}px;

  background-color: ${({ theme }) => theme.colors.card};

  z-index: 10000;
  elevation: 30;
`;

export const Option = styled.Pressable`
  min-height: 50px;

  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  gap: 10px;

  padding: 7px 9px;

  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md}px;

  background-color: ${({ theme }) => theme.colors.card};
`;

export const OptionContent = styled.View`
  flex: 1;

  flex-direction: row;
  align-items: center;

  gap: 10px;
`;

export const IconBox = styled.View`
  width: 34px;
  height: 34px;

  align-items: center;
  justify-content: center;

  border-radius: ${({ theme }) => theme.radius.full}px;
`;

export const OptionText = styled.Text`
  flex: 1;

  font-size: ${({ theme }) => theme.size.base}px;
`;

export const dropdownContent: ViewStyle = {
  gap: 5,
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

export const getRootStyle = (opened: boolean): ViewStyle => ({
  zIndex: opened ? 10000 : 1,
  elevation: opened ? 30 : 1,
});

export const getFieldStyle = (theme: Theme, opened: boolean): ViewStyle => ({
  borderColor: opened ? theme.colors.primary : theme.colors.border,
});

export const getFieldTextStyle = (
  theme: Theme,
  hasValue: boolean
): TextStyle => ({
  color: hasValue ? theme.colors.text : theme.colors.muted,
});

export const getDropdownStyle = (
  hasLabel: boolean,
  inlineOptions: boolean
): ViewStyle => {
  if (inlineOptions) {
    return {
      position: 'relative',
      maxHeight: 230,
    };
  }

  return {
    position: 'absolute',

    top: hasLabel ? 74 : 52,
    left: 0,
    right: 0,

    maxHeight: 230,
  };
};

export const getOptionStyle = (theme: Theme, selected: boolean): ViewStyle => ({
  borderWidth: selected ? 2 : theme.border.width.sm,

  borderColor: selected ? theme.colors.primary : theme.colors.border,
});

export const getIconBoxStyle = (
  theme: Theme,
  tone: SelectDropdownTone,
  selected: boolean
): ViewStyle => ({
  backgroundColor: selected
    ? getToneColor(theme, tone)
    : getToneSoftBackground(theme, tone),
});

export const getOptionTextStyle = (
  theme: Theme,
  selected: boolean
): TextStyle => ({
  color: selected ? theme.colors.primary : theme.colors.text,

  fontWeight: selected ? theme.weight.semibold : theme.weight.medium,
});
