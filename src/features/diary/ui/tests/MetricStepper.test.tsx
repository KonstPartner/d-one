import { useState } from 'react';
import { ThemeProvider } from '@emotion/react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { lightTheme } from '@features/theme/model';

import MetricStepper from '../MetricStepper';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

type ControlledMetricStepperProps = {
  initialValue: number | null;
  maximum?: number;
  disabled?: boolean;
  onChange: jest.Mock;
};

const ControlledMetricStepper = ({
  initialValue,
  maximum = 100,
  disabled = false,
  onChange,
}: ControlledMetricStepperProps) => {
  const [value, setValue] = useState<number | null>(initialValue);

  const handleChange = (nextValue: number | null) => {
    onChange(nextValue);
    setValue(nextValue);
  };

  return (
    <ThemeProvider theme={lightTheme}>
      <MetricStepper
        metricKey="glucose"
        icon="water"
        label="Glucose"
        value={value}
        maximum={maximum}
        disabled={disabled}
        inputAccessibilityLabel="Glucose value"
        decrementAccessibilityLabel="Decrease glucose"
        incrementAccessibilityLabel="Increase glucose"
        onChange={handleChange}
      />
    </ThemeProvider>
  );
};

describe('MetricStepper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('increments and decrements by one without losing the fraction', () => {
    const onChange = jest.fn();

    render(<ControlledMetricStepper initialValue={1.4} onChange={onChange} />);

    fireEvent.press(screen.getByLabelText('Increase glucose'));

    expect(onChange).toHaveBeenLastCalledWith(2.4);
    expect(screen.getByLabelText('Glucose value').props.value).toBe('2.4');

    fireEvent.press(screen.getByLabelText('Decrease glucose'));

    expect(onChange).toHaveBeenLastCalledWith(1.4);
    expect(screen.getByLabelText('Glucose value').props.value).toBe('1.4');
  });

  it('increments by five once after a long press', () => {
    const onChange = jest.fn();

    render(<ControlledMetricStepper initialValue={1.4} onChange={onChange} />);

    const incrementButton = screen.getByLabelText('Increase glucose');

    fireEvent(incrementButton, 'pressIn');
    fireEvent(incrementButton, 'longPress');
    fireEvent.press(incrementButton);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(6.4);
    expect(screen.getByLabelText('Glucose value').props.value).toBe('6.4');
  });

  it('decrements by five once after a long press', () => {
    const onChange = jest.fn();

    render(<ControlledMetricStepper initialValue={6.4} onChange={onChange} />);

    const decrementButton = screen.getByLabelText('Decrease glucose');

    fireEvent(decrementButton, 'pressIn');
    fireEvent(decrementButton, 'longPress');
    fireEvent.press(decrementButton);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(1.4);
    expect(screen.getByLabelText('Glucose value').props.value).toBe('1.4');
  });

  it('normalizes comma input and preserves one decimal place', () => {
    const onChange = jest.fn();

    render(<ControlledMetricStepper initialValue={null} onChange={onChange} />);

    const input = screen.getByLabelText('Glucose value');

    fireEvent.changeText(input, '7,5');

    expect(onChange).toHaveBeenLastCalledWith(7.5);
    expect(input.props.value).toBe('7,5');

    fireEvent(input, 'blur');

    expect(screen.getByLabelText('Glucose value').props.value).toBe('7.5');
  });

  it('rejects input containing more than one decimal place', () => {
    const onChange = jest.fn();

    render(<ControlledMetricStepper initialValue={7.5} onChange={onChange} />);

    const input = screen.getByLabelText('Glucose value');

    fireEvent.changeText(input, '7.55');

    expect(onChange).not.toHaveBeenCalled();
    expect(input.props.value).toBe('7.5');
  });

  it('clears the value through manual input', () => {
    const onChange = jest.fn();

    render(<ControlledMetricStepper initialValue={4.5} onChange={onChange} />);

    const input = screen.getByLabelText('Glucose value');

    fireEvent.changeText(input, '');

    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(input.props.value).toBe('');
  });

  it('changes zero to null when decrementing', () => {
    const onChange = jest.fn();

    render(<ControlledMetricStepper initialValue={0} onChange={onChange} />);

    const decrementButton = screen.getByLabelText('Decrease glucose');

    expect(decrementButton.props.accessibilityState).toEqual({
      disabled: false,
    });

    fireEvent.press(decrementButton);

    expect(onChange).toHaveBeenCalledWith(null);
    expect(screen.getByLabelText('Glucose value').props.value).toBe('');
  });

  it('creates value one when incrementing an empty field', () => {
    const onChange = jest.fn();

    render(<ControlledMetricStepper initialValue={null} onChange={onChange} />);

    fireEvent.press(screen.getByLabelText('Increase glucose'));

    expect(onChange).toHaveBeenCalledWith(1);
    expect(screen.getByLabelText('Glucose value').props.value).toBe('1');
  });

  it('disables incrementing at the maximum value', () => {
    const onChange = jest.fn();

    render(
      <ControlledMetricStepper
        initialValue={40}
        maximum={40}
        onChange={onChange}
      />
    );

    const incrementButton = screen.getByLabelText('Increase glucose');

    expect(incrementButton.props.accessibilityState).toEqual({
      disabled: true,
    });

    fireEvent.press(incrementButton);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('disables input and every action when the component is disabled', () => {
    const onChange = jest.fn();

    render(
      <ControlledMetricStepper initialValue={4} disabled onChange={onChange} />
    );

    expect(screen.getByLabelText('Glucose value').props.editable).toBe(false);

    ['Decrease glucose', 'Increase glucose'].forEach((accessibilityLabel) => {
      const button = screen.getByLabelText(accessibilityLabel);

      expect(button.props.accessibilityState).toEqual({
        disabled: true,
      });

      fireEvent.press(button);
    });

    expect(onChange).not.toHaveBeenCalled();
  });
});
