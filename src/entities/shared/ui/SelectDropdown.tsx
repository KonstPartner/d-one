import { ReactNode, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';

import * as styles from '@entities/shared/styles/SelectDropdown';
import * as globalStyles from '@features/shared/styles/global';

export type SelectDropdownTone = 'primary' | 'success' | 'warning' | 'danger';

export type SelectDropdownOption<T> = {
  value: T;
  label: string;
  key?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  tone?: SelectDropdownTone;
};

type SelectDropdownProps<T> = {
  label?: string;
  placeholder: string;
  selectedLabel?: string | null;
  options: SelectDropdownOption<T>[];
  onSelect: (value: T) => void;
  isSelected?: (option: SelectDropdownOption<T>) => boolean;
  renderOption?: (params: {
    option: SelectDropdownOption<T>;
    selected: boolean;
    onPress: () => void;
  }) => ReactNode;
  empty?: ReactNode;
  footer?: ReactNode;
};

const SelectDropdown = <T,>({
  label,
  placeholder,
  selectedLabel,
  options,
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

  return (
    <View style={styles.Container(opened)}>
      {label ? (
        <Text
          style={[
            globalStyles.MediumTitle(theme),
            globalStyles.MutedText(theme),
          ]}
        >
          {label}
        </Text>
      ) : null}

      <Pressable
        style={styles.Field(theme, opened)}
        onPress={() => setOpened((prev) => !prev)}
        accessibilityRole="button"
      >
        <View style={styles.FieldContent}>
          {selectedOption?.icon ? (
            <View
              style={styles.IconBox(
                theme,
                selectedOption.tone ?? 'primary',
                false
              )}
            >
              <Ionicons
                name={selectedOption.icon}
                size={18}
                color={styles.getToneColor(
                  theme,
                  selectedOption.tone ?? 'primary'
                )}
              />
            </View>
          ) : null}

          <Text style={styles.FieldText(theme, hasValue)} numberOfLines={1}>
            {selectedLabel || placeholder}
          </Text>
        </View>

        <Ionicons
          name={opened ? 'chevron-up-outline' : 'chevron-down-outline'}
          size={20}
          color={theme.colors.muted}
        />
      </Pressable>

      {opened ? (
        <View style={styles.Dropdown(theme, hasLabel)}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.DropdownScrollContent}
          >
            {options.length
              ? options.map((option) => {
                  const selected = isSelected?.(option) ?? false;

                  const onPress = () => {
                    onSelect(option.value);
                    setOpened(false);
                  };

                  if (renderOption) {
                    return (
                      <View key={option.key ?? String(option.label)}>
                        {renderOption({ option, selected, onPress })}
                      </View>
                    );
                  }

                  const tone = option.tone ?? 'primary';

                  return (
                    <Pressable
                      key={option.key ?? String(option.label)}
                      style={styles.Option(theme, selected)}
                      onPress={onPress}
                      accessibilityRole="button"
                    >
                      <View style={styles.OptionContent}>
                        {option.icon ? (
                          <View style={styles.IconBox(theme, tone, selected)}>
                            <Ionicons
                              name={option.icon}
                              size={20}
                              color={
                                selected
                                  ? theme.colors.white
                                  : styles.getToneColor(theme, tone)
                              }
                            />
                          </View>
                        ) : null}

                        <Text style={styles.OptionText(theme, selected)}>
                          {option.label}
                        </Text>
                      </View>

                      {selected ? (
                        <Ionicons
                          name="checkmark"
                          size={18}
                          color={styles.getToneColor(theme, tone)}
                        />
                      ) : null}
                    </Pressable>
                  );
                })
              : empty}

            {footer}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
};

export default SelectDropdown;
