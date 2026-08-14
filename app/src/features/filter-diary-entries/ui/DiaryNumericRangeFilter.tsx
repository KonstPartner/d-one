import { useCallback } from 'react';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';

import { isDiaryEntryNumericRangeValid } from '@entities/diary';
import * as ss from '@shared/styles';
import { Button } from '@shared/ui';

import type { NumericBoundary } from '../lib/numericRange';
import type {
  DiaryFilterNumericField,
  DiaryFilterNumericRange,
} from '../model/types';
import * as s from '../styles/DiaryNumericRangeFilter';

import { NumericRangeSlider } from './NumericRangeSlider';

type DiaryNumericRangeFilterProps = {
  field: DiaryFilterNumericField;

  label: string;

  range: DiaryFilterNumericRange;

  minText: string;
  maxText: string;

  scaleMinimum: number;
  scaleMaximum: number;

  step: number;
  color: string;

  fromLabel: string;
  toLabel: string;

  nullLabel: string;
  resetLabel: string;
  errorText: string;

  onTextChange: (
    field: DiaryFilterNumericField,
    boundary: NumericBoundary,
    text: string
  ) => void;

  onRangeChange: (
    field: DiaryFilterNumericField,
    boundary: NumericBoundary,
    value: number | null
  ) => void;

  onReset: (field: DiaryFilterNumericField) => void;
};

export const DiaryNumericRangeFilter = ({
  field,
  label,
  range,
  minText,
  maxText,
  scaleMinimum,
  scaleMaximum,
  step,
  color,
  fromLabel,
  toLabel,
  nullLabel,
  resetLabel,
  errorText,
  onTextChange,
  onRangeChange,
  onReset,
}: DiaryNumericRangeFilterProps) => {
  const theme = useTheme();

  const invalid = !isDiaryEntryNumericRangeValid(range);

  const canReset =
    range.min !== null ||
    range.max !== null ||
    minText.length > 0 ||
    maxText.length > 0;

  const handleSliderChange = useCallback(
    (boundary: NumericBoundary, value: number | null) => {
      onRangeChange(field, boundary, value);
    },
    [field, onRangeChange]
  );

  return (
    <s.Root style={[ss.Surface(theme, 'card'), ss.Rounded(theme, 'lg')]}>
      <s.Header>
        <s.Title>{label}</s.Title>

        <s.ResetTextButton
          $disabled={!canReset}
          disabled={!canReset}
          accessibilityRole="button"
          accessibilityLabel={`${resetLabel}: ${label}`}
          accessibilityState={{
            disabled: !canReset,
          }}
          onPress={() => onReset(field)}
        >
          <s.ResetText $disabled={!canReset}>{resetLabel}</s.ResetText>
        </s.ResetTextButton>
      </s.Header>

      <s.SliderHost testID={`diary-filter-${field}-slider`}>
        <NumericRangeSlider
          range={range}
          label={label}
          fromLabel={fromLabel}
          toLabel={toLabel}
          nullLabel={nullLabel}
          scaleMinimum={scaleMinimum}
          scaleMaximum={scaleMaximum}
          step={step}
          color={color}
          onChange={handleSliderChange}
        />
      </s.SliderHost>

      <s.Inputs>
        <s.InputColumn>
          <s.InputLabel>{fromLabel}</s.InputLabel>

          <s.Input
            $invalid={invalid}
            accessibilityLabel={`${label}: ${fromLabel}`}
            keyboardType="decimal-pad"
            inputMode="decimal"
            value={minText}
            placeholder={String(scaleMinimum)}
            placeholderTextColor={theme.colors.muted}
            onChangeText={(text) => onTextChange(field, 'min', text)}
          />
        </s.InputColumn>

        <s.InputColumn>
          <s.InputLabel>{toLabel}</s.InputLabel>

          <s.Input
            $invalid={invalid}
            accessibilityLabel={`${label}: ${toLabel}`}
            keyboardType="decimal-pad"
            inputMode="decimal"
            value={maxText}
            placeholder={String(scaleMaximum)}
            placeholderTextColor={theme.colors.muted}
            onChangeText={(text) => onTextChange(field, 'max', text)}
          />
        </s.InputColumn>

        <Button
          accessibilityLabel={`${resetLabel}: ${label}`}
          disabled={!canReset}
          tone="muted"
          style={s.getResetButtonStyle(theme)}
          onPress={() => onReset(field)}
        >
          <Ionicons
            name="refresh"
            size={theme.size.md}
            color={canReset ? theme.colors.text : theme.colors.muted}
          />
        </Button>
      </s.Inputs>

      {invalid && <s.ErrorText>{errorText}</s.ErrorText>}
    </s.Root>
  );
};
