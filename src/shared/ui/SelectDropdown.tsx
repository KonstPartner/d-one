import { useState } from 'react';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';

import type {
  SelectDropdownOption,
  SelectDropdownProps,
} from './SelectDropdown.types';
import * as s from './styles/SelectDropdown';

export const SelectDropdown = <T,>({
  label,
  placeholder,

  selectedLabel,

  options,

  inlineOptions = false,

  onSelect,
  isSelected,
  renderOption,

  empty,
  footer,
}: SelectDropdownProps<T>) => {
  const theme = useTheme();

  const [opened, setOpened] = useState(false);

  const hasValue = Boolean(selectedLabel);

  const hasLabel = Boolean(label);

  const selectedOption =
    options.find((option) => isSelected?.(option) ?? false) ?? null;

  const handleSelect = (option: SelectDropdownOption<T>): void => {
    onSelect(option.value);
    setOpened(false);
  };

  return (
    <s.Root style={s.getRootStyle(opened)}>
      {label ? <s.Label>{label}</s.Label> : null}

      <s.Field
        accessibilityRole="button"
        accessibilityState={{
          expanded: opened,
        }}
        style={s.getFieldStyle(theme, opened)}
        onPress={() => {
          setOpened((current) => !current);
        }}
      >
        <s.FieldContent>
          {selectedOption?.icon ? (
            <s.IconBox
              style={s.getIconBoxStyle(
                theme,
                selectedOption.tone ?? 'primary',
                false
              )}
            >
              <Ionicons
                name={selectedOption.icon}
                size={18}
                color={s.getToneColor(theme, selectedOption.tone ?? 'primary')}
              />
            </s.IconBox>
          ) : null}

          <s.FieldText
            numberOfLines={1}
            style={s.getFieldTextStyle(theme, hasValue)}
          >
            {selectedLabel || placeholder}
          </s.FieldText>
        </s.FieldContent>

        <Ionicons
          name={opened ? 'chevron-up-outline' : 'chevron-down-outline'}
          size={20}
          color={theme.colors.muted}
        />
      </s.Field>

      {opened ? (
        <s.Dropdown style={s.getDropdownStyle(hasLabel, inlineOptions)}>
          <ScrollView
            testID="select-dropdown-options"
            disallowInterruption
            bounces={false}
            overScrollMode="never"
            showsVerticalScrollIndicator
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={s.dropdownContent}
          >
            {options.length > 0
              ? options.map((option) => {
                  const selected = isSelected?.(option) ?? false;

                  const onPress = (): void => {
                    handleSelect(option);
                  };

                  const optionKey = option.key ?? option.label;

                  if (renderOption) {
                    return (
                      <s.OptionContent key={optionKey}>
                        {renderOption({
                          option,
                          selected,
                          onPress,
                        })}
                      </s.OptionContent>
                    );
                  }

                  const tone = option.tone ?? 'primary';

                  return (
                    <s.Option
                      key={optionKey}
                      accessibilityRole="button"
                      accessibilityState={{
                        selected,
                      }}
                      style={s.getOptionStyle(theme, selected)}
                      onPress={onPress}
                    >
                      <s.OptionContent>
                        {option.icon ? (
                          <s.IconBox
                            style={s.getIconBoxStyle(theme, tone, selected)}
                          >
                            <Ionicons
                              name={option.icon}
                              size={20}
                              color={
                                selected
                                  ? theme.colors.white
                                  : s.getToneColor(theme, tone)
                              }
                            />
                          </s.IconBox>
                        ) : null}

                        <s.OptionText
                          style={s.getOptionTextStyle(theme, selected)}
                        >
                          {option.label}
                        </s.OptionText>
                      </s.OptionContent>

                      {selected ? (
                        <Ionicons
                          name="checkmark"
                          size={18}
                          color={s.getToneColor(theme, tone)}
                        />
                      ) : null}
                    </s.Option>
                  );
                })
              : empty}

            {footer}
          </ScrollView>
        </s.Dropdown>
      ) : null}
    </s.Root>
  );
};
