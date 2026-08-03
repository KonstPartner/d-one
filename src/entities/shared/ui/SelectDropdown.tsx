import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { ScrollView } from 'react-native-gesture-handler';

import type { SelectDropdownOption } from '@features/shared/model';
import * as globalStyles from '@features/shared/styles/global';

import * as styles from '../styles/SelectDropdown';

type SelectDropdownProps<T> = {
  label?: string;
  placeholder: string;
  selectedLabel?: string | null;
  options: SelectDropdownOption<T>[];
  inlineOptions?: boolean;
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

  const optionItems = options.length
    ? options.map((option) => {
        const selected = isSelected?.(option) ?? false;

        const handlePress = () => {
          onSelect(option.value);
          setOpened(false);
        };

        if (renderOption) {
          return (
            <View key={option.key ?? String(option.label)}>
              {renderOption({
                option,
                selected,
                onPress: handlePress,
              })}
            </View>
          );
        }

        const tone = option.tone ?? 'primary';

        return (
          <Pressable
            key={option.key ?? String(option.label)}
            style={styles.Option(theme, selected)}
            onPress={handlePress}
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
    : empty;

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
        onPress={() => setOpened((previous) => !previous)}
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
        <View style={styles.Dropdown(theme, hasLabel, inlineOptions)}>
          <ScrollView
            testID="select-dropdown-options"
            disallowInterruption
            bounces={false}
            overScrollMode="never"
            showsVerticalScrollIndicator
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.DropdownContent}
          >
            {optionItems}
            {footer}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
};

export default SelectDropdown;
