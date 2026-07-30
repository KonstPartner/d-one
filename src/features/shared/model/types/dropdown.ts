import { Ionicons } from '@expo/vector-icons';

export type SelectDropdownTone = 'primary' | 'success' | 'warning' | 'danger';

export type SelectDropdownOption<T> = {
  value: T;
  label: string;
  key?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  tone?: SelectDropdownTone;
};
