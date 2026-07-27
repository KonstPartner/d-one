import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { css } from '@emotion/native';
import { Theme } from '@emotion/react';

export const WeekWrapperRN: ViewStyle = {};

export const WeekHeaderRN: ViewStyle = {
  paddingTop: 18,
  paddingBottom: 6,
  alignItems: 'center',
  justifyContent: 'center',
};

export const WeekHeaderTextRN = (theme: Theme): TextStyle => ({
  color: theme.colors.text,
  fontSize: 14,
  fontWeight: '600',
});

export const BottomSlotRN: ViewStyle = {
  height: 56,
  justifyContent: 'center',
  alignItems: 'center',
};

export const DayWrapper: ViewStyle = {};

export const DayContainer = (
  theme: Theme,
  {
    isSelected,
    isToday,
    disabled,
    highlightSelected,
  }: {
    isSelected: boolean;
    isToday: boolean;
    disabled: boolean;
    highlightSelected: boolean;
  }
): ViewStyle => {
  const bgColor =
    highlightSelected && isSelected ? theme.colors.primary : 'transparent';

  const borderWidth = isToday ? 2 : 0;
  const borderColor = isToday ? theme.colors.primary : 'transparent';

  return {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: bgColor,
    borderWidth,
    borderColor,
    opacity: disabled ? 0.4 : 1,
  };
};

export const DayText = (
  theme: Theme,
  {
    isSelected,
    disabled,
  }: {
    isSelected: boolean;
    disabled: boolean;
  }
): TextStyle => {
  let color = theme.colors.text;

  if (disabled) {
    color = theme.colors.muted;
  } else if (isSelected) {
    color = '#FFFFFF';
  }

  return {
    fontSize: 14,
    fontWeight: isSelected ? '700' : '500',
    color,
  };
};

export const DayDotsRow: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'center',
  gap: 3,
  marginTop: -10,
};

export const DayDot = (color: string): ViewStyle => ({
  width: 4,
  height: 4,
  borderRadius: 2,
  backgroundColor: color,
});

export const ModeSwitch = (theme: Theme) =>
  css`
    flex-direction: row;
    border-radius: 999px;
    border: 1px solid ${theme.colors.border};
    background-color: ${theme.colors.input};
    padding: 3px;
    gap: 3px;
    width: 80%;
    margin: 0 auto;
  ` as StyleProp<ViewStyle>;

export const ModeSwitchItem = (theme: Theme, isActive: boolean) =>
  css`
    flex: 1;
    border-radius: 999px;
    padding: 10px 12px;
    align-items: center;
    justify-content: center;
    background-color: ${isActive ? theme.colors.primary : 'transparent'};
  ` as StyleProp<ViewStyle>;

export const ModeSwitchText = (theme: Theme, isActive: boolean) =>
  css`
    color: ${isActive ? theme.colors.card : theme.colors.text};
    font-weight: 900;
    font-size: 13px;
  ` as StyleProp<TextStyle>;
