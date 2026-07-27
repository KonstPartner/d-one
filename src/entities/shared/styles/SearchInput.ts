import {
  RegisteredStyle,
  StyleProp,
  TextStyle,
  ViewStyle as ViewStyleProp,
} from 'react-native';
import { css } from '@emotion/native';
import { Theme } from '@emotion/react';

export const ViewStyle = css`
  position: relative;
  flex-direction: row;
  align-items: center;
` as StyleProp<ViewStyleProp>;

export const Input = (withLabel: boolean, hasValue: boolean) =>
  css`
    width: 100%;
    padding-left: 44px;
    padding-right: ${hasValue ? '44px' : '16px'};
    padding-top: ${withLabel ? '30px' : '12px'};
    border-radius: 9999px;
  ` as RegisteredStyle<TextStyle>;

export const TouchableOpacityStyle = (
  theme: Theme,
  withLabel: boolean,
  isFocused: boolean
) =>
  css`
    border-radius: 9999px;
    padding: 2px;
    position: absolute;
    left: 14px;
    top: ${withLabel ? '36px' : '10px'};
    justify-content: center;
    align-items: center;
    z-index: 1;
    background-color: ${isFocused ? theme.colors.card : theme.colors.input};
  ` as StyleProp<ViewStyleProp>;

export const ClearButton = (withLabel: boolean) =>
  css`
    position: absolute;
    right: 14px;
    top: ${withLabel ? '37px' : '15px'};
    justify-content: center;
    align-items: center;
    z-index: 1;
  ` as StyleProp<ViewStyleProp>;
