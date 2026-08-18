import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';

export type SelectDropdownTone = 'primary' | 'success' | 'warning' | 'danger';

type SelectDropdownOptionColors = {
  text: string;
  background: string;
  border: string;
};

export type SelectDropdownOption<T> = {
  value: T;
  label: string;

  key?: string;

  icon?: ComponentProps<typeof Ionicons>['name'];

  tone?: SelectDropdownTone;

  colors?: SelectDropdownOptionColors;
};

type SelectDropdownRenderOptionParams<T> = {
  option: SelectDropdownOption<T>;
  selected: boolean;
  onPress: () => void;
};

export type SelectDropdownProps<T> = {
  label?: string;
  placeholder: string;

  selectedLabel?: string | null;

  options: readonly SelectDropdownOption<T>[];

  inlineOptions?: boolean;
  disabled?: boolean;

  onSelect: (value: T) => void;

  isSelected?: (option: SelectDropdownOption<T>) => boolean;

  renderOption?: (params: SelectDropdownRenderOptionParams<T>) => ReactNode;

  renderSelectedIcon?: (option: SelectDropdownOption<T>) => ReactNode;

  empty?: ReactNode;
  footer?: ReactNode;
};
