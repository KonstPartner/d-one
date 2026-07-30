import { Ref, useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
} from 'react-native';
import { useTheme } from '@emotion/react';

import { ValidateInputType } from '@features/shared/model';
import * as globalStyles from '@features/shared/styles/global';
import InvalidMessageText from '@features/shared/ui/InvalidMessageText';

import * as styles from '../styles/Input';

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

const Input = ({
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
  ...props
}: InputProps) => {
  const theme = useTheme();

  const [isFocused, setIsFocused] = useState(false);

  const InputStyles = [styles.TextInput(theme, isFocused), style];
  const InputStylesFlatten = StyleSheet.flatten(InputStyles) as TextStyle;

  return (
    <>
      {withLabel && (
        <Text style={globalStyles.Label(theme)}>
          {labelPlaceholder || placeholder}
        </Text>
      )}

      <TextInput
        ref={inputRef}
        style={InputStylesFlatten}
        placeholderTextColor={theme.colors.muted}
        accessibilityLabel={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        maxLength={255}
        onFocus={() => {
          setIsFocused(true);
          onFocusEvent?.();
        }}
        onBlur={() => {
          setIsFocused(false);
          onBlurEvent?.();
        }}
        {...props}
      />

      {enableInvalidMessageText && (
        <InvalidMessageText
          field={field!}
          value={value as string}
          isActive={isActiveInvalidMessageText}
        />
      )}
    </>
  );
};

export default Input;
