import { useTheme } from '@emotion/react';

import * as s from './styles/SegmentedSwitch';

export type SegmentedSwitchOption<T extends string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

export type SegmentedSwitchProps<T extends string> = {
  value: T;

  options: readonly SegmentedSwitchOption<T>[];

  onChange: (value: T) => void;

  label?: string;
  disabled?: boolean;
};

export const SegmentedSwitch = <T extends string>({
  value,
  options,
  onChange,
  label,
  disabled = false,
}: SegmentedSwitchProps<T>) => {
  const theme = useTheme();

  return (
    <s.Wrapper>
      {label ? <s.Label>{label}</s.Label> : null}

      <s.Container>
        {options.map((option) => {
          const active = option.value === value;

          const optionDisabled = disabled || option.disabled === true;

          return (
            <s.Segment
              key={option.value}
              disabled={optionDisabled}
              accessibilityRole="button"
              accessibilityState={{
                selected: active,
                disabled: optionDisabled,
              }}
              style={s.getSegmentStyle(theme, active, optionDisabled)}
              onPress={() => {
                if (!optionDisabled) {
                  onChange(option.value);
                }
              }}
            >
              <s.SegmentText
                style={s.getSegmentTextStyle(theme, active, optionDisabled)}
              >
                {option.label}
              </s.SegmentText>
            </s.Segment>
          );
        })}
      </s.Container>
    </s.Wrapper>
  );
};
