import { StyleProp, TextStyle, ViewStyle as ViewStyleProp } from 'react-native';
import { css } from '@emotion/native';
import { Theme } from '@emotion/react';

export const ViewStyle = css`
  position: relative;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
` as StyleProp<ViewStyleProp>;

export const TextInput = (theme: Theme, isFocused: boolean) =>
  css`
    width: 100%;
    background-color: ${theme.colors.input};
    border-color: ${theme.colors.border};
    border-width: 2px;
    border-style: solid;
    border-radius: 6px;
    padding: 12px 16px;
    font-size: 16px;
    color: ${theme.colors.text};
    outline-width: 0;
    outline-style: none;
    box-shadow: none;

    background-color: ${isFocused ? theme.colors.card : theme.colors.input};
    border-color: ${isFocused ? theme.colors.primary : 'transparent'};
    border-width: 1px;
    border-style: solid;

    font-size: 16px;
    color: ${theme.colors.text};
  ` as StyleProp<TextStyle>;

export const PasswordContainer = css`
  position: relative;
  width: 100%;
` as StyleProp<ViewStyleProp>;

export const PasswordInputPadding = css`
  padding-right: 52px;
` as any;

export const PasswordIconButton = css`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 52px;
  align-items: center;
  justify-content: center;
` as StyleProp<ViewStyleProp>;
