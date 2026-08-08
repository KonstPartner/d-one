import { forwardRef } from 'react';
import { TextInput } from 'react-native';
import { useTheme } from '@emotion/react';

import { Input, type InputProps } from './Input';
import * as s from './styles/TextArea';

export type TextAreaProps = Omit<
  InputProps,
  'inputRef' | 'value' | 'onChangeText' | 'multiline'
> & {
  value: string;

  onChangeText: (value: string) => void;

  maxLength?: number;
  showCharacterCount?: boolean;
};

export const TextArea = forwardRef<TextInput, TextAreaProps>(
  (
    {
      value,
      onChangeText,
      maxLength = 1000,
      showCharacterCount = true,
      style,
      selectionHandleColor,
      ...inputProps
    },
    ref
  ) => {
    const theme = useTheme();

    return (
      <s.Container>
        <Input
          {...inputProps}
          inputRef={ref}
          value={value}
          onChangeText={onChangeText}
          multiline
          scrollEnabled
          maxLength={maxLength}
          textAlignVertical="top"
          selectionHandleColor={selectionHandleColor ?? theme.colors.primary}
          style={[s.getInputStyle(theme), style]}
        />

        {showCharacterCount && (
          <s.CharacterCount>
            {value.length}/{maxLength}
          </s.CharacterCount>
        )}
      </s.Container>
    );
  }
);

TextArea.displayName = 'TextArea';
