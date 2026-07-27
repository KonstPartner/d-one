import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';

import * as styles from '@entities/shared/styles/SearchInput';
import Input, { InputProps } from '@entities/shared/ui/Input';

const SearchInput = (
  props: InputProps & {
    isActiveSearch?: boolean;
    onSearchClick: (userInput: string) => void;
  }
) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const {
    value,
    onSearchClick,
    onChangeText,
    withLabel,
    isActiveSearch,
    ...inputProps
  } = props;
  const hasValue = Boolean(String(value ?? '').length);
  const onClear = () => {
    onChangeText?.('');
    onSearchClick('');
  };

  return (
    <View style={styles.ViewStyle}>
      <Pressable
        style={styles.TouchableOpacityStyle(theme, !!withLabel, isFocused)}
        onPress={() => onSearchClick(String(value ?? ''))}
      >
        <Ionicons
          name="search-outline"
          size={20}
          color={
            isFocused || isActiveSearch
              ? theme.colors.primary
              : theme.colors.muted
          }
        />
      </Pressable>

      {hasValue && (
        <Pressable style={styles.ClearButton(!!withLabel)} onPress={onClear}>
          <Ionicons name="close-circle" size={18} color={theme.colors.muted} />
        </Pressable>
      )}

      <Input
        style={styles.Input(!!withLabel, hasValue)}
        value={value}
        onChangeText={onChangeText}
        onFocusEvent={() => {
          setIsFocused(true);
        }}
        onBlurEvent={() => {
          setIsFocused(false);
        }}
        onSubmitEditing={(event) => {
          onSearchClick(String(value ?? ''));
          inputProps.onSubmitEditing?.(event);
        }}
        {...inputProps}
      />
    </View>
  );
};

export default SearchInput;
