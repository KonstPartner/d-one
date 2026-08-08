import styled from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { TextStyle, ViewStyle } from 'react-native';

export const Wrapper = styled.View`
  width: 100%;

  align-items: center;

  gap: 5px;

  margin: 0 auto;
`;

export const Label = styled.Text`
  color: ${({ theme }) => theme.colors.muted};

  font-size: ${({ theme }) => theme.size.base}px;
  font-weight: ${({ theme }) => theme.weight.medium};
`;

export const Container = styled.View`
  width: 100%;
  min-height: 40px;

  flex-direction: row;
  align-items: center;

  overflow: hidden;

  padding: 4px;

  border-width: ${({ theme }) => theme.border.width.sm}px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg}px;

  background-color: ${({ theme }) => theme.colors.input};
`;

export const Segment = styled.Pressable`
  flex: 1;

  min-height: 32px;

  align-items: center;
  justify-content: center;

  border-radius: ${({ theme }) => theme.radius.lg}px;
`;

export const SegmentText = styled.Text`
  font-size: ${({ theme }) => theme.size.md}px;
  font-weight: ${({ theme }) => theme.weight.bold};
`;

export const getSegmentStyle = (
  theme: Theme,
  active: boolean,
  disabled: boolean
): ViewStyle => ({
  backgroundColor: active ? theme.colors.primary : 'transparent',

  opacity: disabled ? 0.55 : 1,
});

export const getSegmentTextStyle = (
  theme: Theme,
  active: boolean,
  disabled: boolean
): TextStyle => ({
  color: active ? theme.colors.white : theme.colors.text,

  opacity: disabled ? 0.75 : 1,
});
