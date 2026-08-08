import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';

export type SelectDropdownTone = 'primary' | 'success' | 'warning' | 'danger';

export type SelectDropdownOption<T> = {
  value: T;
  label: string;

  key?: string;

  icon?: ComponentProps<typeof Ionicons>['name'];

  tone?: SelectDropdownTone;
};

export type SelectDropdownRenderOptionParams<T> = {
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

  onSelect: (value: T) => void;

  isSelected?: (option: SelectDropdownOption<T>) => boolean;

  renderOption?: (params: SelectDropdownRenderOptionParams<T>) => ReactNode;

  empty?: ReactNode;
  footer?: ReactNode;
};
