import { useState } from 'react';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';

import * as ss from '@shared/styles';

import type { InputProps } from './Input';
import * as s from './styles/SearchInput';

export type SearchInputProps = InputProps & {
  isActiveSearch?: boolean;

  onSearchClick: (value: string) => void;
};

export const SearchInput = ({
  value,

  onSearchClick,
  onChangeText,

  withLabel = false,
  isActiveSearch = false,

  style,

  onFocusEvent,
  onBlurEvent,
  onSubmitEditing,

  ...inputProps
}: SearchInputProps) => {
  const theme = useTheme();

  const [isFocused, setIsFocused] = useState(false);

  const textValue = String(value ?? '');

  const hasValue = textValue.length > 0;

  const handleSearch = (): void => {
    onSearchClick(textValue);
  };

  const handleClear = (): void => {
    onChangeText?.('');
    onSearchClick('');
  };

  return (
    <s.Root>
      <s.SearchButton
        accessibilityRole="button"
        style={[
          s.getSearchButtonStyle(theme, withLabel, isFocused),
          ss.CenterContent,
        ]}
        onPress={handleSearch}
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
      </s.SearchButton>

      {hasValue ? (
        <s.ClearButton
          accessibilityRole="button"
          style={s.getClearButtonStyle(withLabel)}
          onPress={handleClear}
        >
          <Ionicons name="close-circle" size={18} color={theme.colors.muted} />
        </s.ClearButton>
      ) : null}

      <s.Field
        {...inputProps}
        value={value}
        onChangeText={onChangeText}
        withLabel={withLabel}
        style={style}
        onFocusEvent={() => {
          setIsFocused(true);
          onFocusEvent?.();
        }}
        onBlurEvent={() => {
          setIsFocused(false);
          onBlurEvent?.();
        }}
        onSubmitEditing={(event) => {
          handleSearch();
          onSubmitEditing?.(event);
        }}
      />
    </s.Root>
  );
};
