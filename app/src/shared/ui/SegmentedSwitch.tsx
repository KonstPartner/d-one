import { useTheme } from '@emotion/react';

import * as ss from '@shared/styles';

import * as s from './styles/SegmentedSwitch';

type SegmentedSwitchOption<T extends string> = {
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

      <s.Container style={[ss.FullWidth, ss.Surface(theme, 'input')]}>
        {options.map((option) => {
          const active = option.value === value;

          const optionDisabled = disabled || option.disabled === true;

          return (
            <s.Segment
              key={option.value}
              $active={active}
              $disabled={optionDisabled}
              disabled={optionDisabled}
              accessibilityRole="button"
              accessibilityState={{
                selected: active,
                disabled: optionDisabled,
              }}
              onPress={() => {
                if (!optionDisabled) {
                  onChange(option.value);
                }
              }}
            >
              <s.SegmentText $active={active} $disabled={optionDisabled}>
                {option.label}
              </s.SegmentText>
            </s.Segment>
          );
        })}
      </s.Container>
    </s.Wrapper>
  );
};
