import { type Ref, useState } from 'react';
import {
  type StyleProp,
  TextInput,
  type TextInputProps,
  type TextStyle,
} from 'react-native';
import { useTheme } from '@emotion/react';

import type { ValidateInputType } from '@shared/lib/validation';

import { InvalidMessageText } from './InvalidMessageText';
import * as s from './styles/Input';

export type InputProps = TextInputProps & {
  style?: StyleProp<TextStyle>;
  inputRef?: Ref<TextInput>;

  enableInvalidMessageText?: boolean;
  field?: ValidateInputType;
  isActiveInvalidMessageText?: boolean;

  withLabel?: boolean;
  labelPlaceholder?: string;

  onFocusEvent?: () => void;
  onBlurEvent?: () => void;
};

export const Input = ({
  value,
  onChangeText,
  withLabel = false,
  placeholder = '',
  labelPlaceholder,
  style,
  inputRef,
  enableInvalidMessageText = false,
  field,
  isActiveInvalidMessageText = false,
  onFocusEvent,
  onBlurEvent,
  onFocus,
  onBlur,
  maxLength,
  placeholderTextColor,
  accessibilityLabel,
  ...inputProps
}: InputProps) => {
  const theme = useTheme();

  const [isFocused, setIsFocused] = useState(false);

  return (
    <>
      {withLabel && <s.Label>{labelPlaceholder || placeholder}</s.Label>}

      <s.Field
        ref={inputRef}
        $focused={isFocused}
        style={style}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor ?? theme.colors.muted}
        accessibilityLabel={accessibilityLabel ?? placeholder}
        maxLength={maxLength ?? 255}
        onFocus={(event) => {
          setIsFocused(true);

          onFocusEvent?.();
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setIsFocused(false);

          onBlurEvent?.();
          onBlur?.(event);
        }}
        {...inputProps}
      />

      {enableInvalidMessageText && field && (
        <InvalidMessageText
          field={field}
          value={String(value ?? '')}
          isActive={isActiveInvalidMessageText}
        />
      )}
    </>
  );
};
