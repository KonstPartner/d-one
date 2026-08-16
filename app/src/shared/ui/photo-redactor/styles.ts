import styled from '@emotion/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import * as ss from '@shared/styles';

export const Root = styled.View`
  position: relative;

  flex: 1;

  background-color: ${({ theme }) => theme.colors.black};
`;

export const SafeArea = styled(SafeAreaView)`
  flex: 1;
`;

export const PortraitContent = styled.View`
  flex: 1;
`;

export const PortraitHeader = styled.View`
  position: relative;

  z-index: 30;

  flex-shrink: 0;

  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  padding-horizontal: ${({ theme }) => ss.px(theme.spacing.md)};
  padding-vertical: ${({ theme }) => ss.px(theme.spacing.xs)};
`;

export const PortraitActions = styled.View`
  flex-direction: row;
  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.xs)};
`;

export const Viewport = styled.View`
  flex: 1;

  overflow: hidden;
`;

export const Canvas = styled.View`
  position: relative;

  overflow: hidden;

  background-color: ${({ theme }) => theme.colors.black};
`;

export const DrawingSurface = styled.View`
  position: absolute;

  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;

export const StateOverlay = styled.View`
  position: absolute;

  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  background-color: ${({ theme }) => theme.colors.blackAlpha.md};
`;

export const LandscapeContent = styled.View`
  flex: 1;
  flex-direction: row;
`;

export const LandscapeControls = styled.View`
  position: relative;

  z-index: 30;

  flex-shrink: 0;

  align-items: center;
  justify-content: space-evenly;

  gap: ${({ theme }) => ss.px(theme.spacing.lg)};
`;

export const ActionButton = styled.Pressable<{
  $disabled?: boolean;
}>`
  width: ${({ theme }) => ss.px(theme.control.height.md)};
  height: ${({ theme }) => ss.px(theme.control.height.md)};

  background-color: ${({ theme }) => theme.colors.blackAlpha.xl};

  opacity: ${({ $disabled }) => ($disabled ? 0.4 : 1)};
`;

export const LandscapeActionButton = styled.Pressable<{
  $disabled?: boolean;
}>`
  width: ${({ theme }) => ss.px(theme.control.height.md)};
  height: ${({ theme }) => ss.px(theme.control.height.md)};

  background-color: transparent;

  opacity: ${({ $disabled }) => ($disabled ? 0.4 : 1)};
`;

export const InfoControl = styled.View`
  position: relative;

  z-index: 40;
`;

export const DismissLayer = styled.Pressable`
  position: absolute;

  z-index: 20;

  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;

export const PortraitInfoBubble = styled.View`
  position: absolute;

  top: 100%;
  right: 0;

  width: 260px;

  margin-top: ${({ theme }) => ss.px(theme.spacing.xs)};

  padding: ${({ theme }) =>
    `${ss.px(theme.spacing.sm)} ${ss.px(theme.spacing.md)}`};

  background-color: ${({ theme }) => theme.colors.blackAlpha.xl};
`;

export const LandscapeInfoBubble = styled.View`
  position: absolute;

  top: 0;
  right: 100%;

  width: 280px;

  margin-right: ${({ theme }) => ss.px(theme.spacing.xs)};

  padding: ${({ theme }) =>
    `${ss.px(theme.spacing.sm)} ${ss.px(theme.spacing.md)}`};

  background-color: ${({ theme }) => theme.colors.blackAlpha.xl};
`;

export const InfoText = styled.Text`
  text-align: center;
`;
