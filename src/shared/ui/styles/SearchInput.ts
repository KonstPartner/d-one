import styled from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { TextStyle, ViewStyle } from 'react-native';

export const Root = styled.View`
  position: relative;

  flex-direction: row;
  align-items: center;
`;

export const SearchButton = styled.Pressable`
  position: absolute;

  left: 14px;

  z-index: 1;

  align-items: center;
  justify-content: center;

  padding: 2px;

  border-radius: 9999px;
`;

export const ClearButton = styled.Pressable`
  position: absolute;

  right: 14px;

  z-index: 1;

  align-items: center;
  justify-content: center;
`;

export const getInputStyle = (
  withLabel: boolean,
  hasValue: boolean
): TextStyle => ({
  width: '100%',

  paddingLeft: 44,
  paddingRight: hasValue ? 44 : 16,
  paddingTop: withLabel ? 30 : 12,

  borderRadius: 9999,
});

export const getSearchButtonStyle = (
  theme: Theme,
  withLabel: boolean,
  focused: boolean
): ViewStyle => ({
  top: withLabel ? 36 : 10,

  backgroundColor: focused ? theme.colors.card : theme.colors.input,
});

export const getClearButtonStyle = (withLabel: boolean): ViewStyle => ({
  top: withLabel ? 37 : 15,
});
