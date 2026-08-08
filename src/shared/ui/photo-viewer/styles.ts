import styled, { css } from '@emotion/native';
import { Image } from 'expo-image';
import type { ViewStyle } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import * as ss from '@shared/styles';

export const GestureRoot = styled(GestureHandlerRootView)`
  flex: 1;

  background-color: ${({ theme }) => theme.colors.black};
`;

export const Root = styled.View`
  flex: 1;

  background-color: ${({ theme }) => theme.colors.black};
`;

export const Viewport = styled.View`
  ${ss.CenterContent};

  flex: 1;

  overflow: hidden;
`;

export const ImageFrame = css`
  align-items: center;
  justify-content: center;
` as ViewStyle;

export const UnmeasuredImageFrame = css`
  width: 100%;
  height: 100%;
` as ViewStyle;

export const Photo = styled(Image)`
  width: 100%;
  height: 100%;
`;

export const StateOverlay = styled.View`
  ${ss.CenterContent};

  position: absolute;

  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;

export const StateText = styled.Text`
  ${({ theme }) => ss.Text(theme, 'sm', 'medium', 'inverse', 'sm')};

  max-width: 80%;

  margin-top: ${({ theme }) => ss.px(theme.spacing.md)};

  text-align: center;
`;

export const Controls = styled(SafeAreaView)`
  position: absolute;

  top: 0;
  right: 0;
  left: 0;

  align-items: flex-end;

  padding: ${({ theme }) => ss.px(theme.spacing.md)};
`;

export const CloseButton = styled.Pressable`
  ${ss.CenterContent};

  ${({ theme }) => ss.Rounded(theme, 'full')};

  width: ${({ theme }) => ss.px(theme.control.height.md)};

  height: ${({ theme }) => ss.px(theme.control.height.md)};

  background-color: ${({ theme }) => theme.colors.blackAlpha.xl};
`;

export const Pressed = css`
  opacity: 0.7;
` as ViewStyle;

export const HintArea = styled(SafeAreaView)`
  position: absolute;

  right: 0;
  bottom: 0;
  left: 0;

  align-items: center;

  padding: ${({ theme }) => ss.px(theme.spacing.md)};
`;

export const HintText = styled.Text`
  ${({ theme }) => ss.Text(theme, 'sm', 'regular', 'inverse', 'sm')};

  padding: ${({ theme }) =>
    `${ss.px(theme.spacing.sm)} ${ss.px(theme.spacing.md)}`};

  overflow: hidden;

  ${({ theme }) => ss.Rounded(theme, 'full')};

  background-color: ${({ theme }) => theme.colors.blackAlpha.xl};

  text-align: center;
`;
