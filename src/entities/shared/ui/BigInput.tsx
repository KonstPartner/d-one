import { forwardRef } from 'react';
import {
  StyleProp,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
} from 'react-native';
import { useTheme } from '@emotion/react';

import * as styles from '@entities/shared/styles/BigInput';
import Input from '@entities/shared/ui/Input';
import { ValidateInput } from '@features/shared/model';

type BigInputProps = Omit<TextInputProps, 'value' | 'onChangeText'> & {
  style?: StyleProp<TextStyle>;
  text: string;
  setText: (str: string) => void;
  isActiveInvalidMessageText?: boolean;
  enableInvalidMessageText?: boolean;
  placeholder?: string;
  field?: ValidateInput;
  maxLength?: number;
  withCharCount?: boolean;
};

const BigInput = forwardRef<TextInput, BigInputProps>(
  (
    {
      text,
      setText,
      isActiveInvalidMessageText,
      enableInvalidMessageText,
      placeholder,
      field,
      maxLength = 1000,
      style,
      withCharCount = true,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();

    return (
      <View style={styles.Container}>
        <Input
          inputRef={ref}
          style={[styles.TextArea(theme), style]}
          multiline
          scrollEnabled
          textAlignVertical="top"
          maxLength={maxLength}
          placeholder={placeholder}
          value={text}
          onChangeText={setText}
          enableInvalidMessageText={enableInvalidMessageText}
          field={field}
          isActiveInvalidMessageText={isActiveInvalidMessageText}
          selectionHandleColor={theme.colors.primary}
          {...props}
        />

        {withCharCount && (
          <View style={styles.CharCountView}>
            <Text style={styles.CharCount(theme)}>
              {text.length}/{maxLength}
            </Text>
          </View>
        )}
      </View>
    );
  }
);

BigInput.displayName = 'BigInput';

export default BigInput;
