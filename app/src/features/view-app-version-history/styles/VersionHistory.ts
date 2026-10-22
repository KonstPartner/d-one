import styled from '@emotion/native';
import type { Theme } from '@emotion/react';
import type {
  PressableStateCallbackType,
  TextStyle,
  ViewStyle,
} from 'react-native';

import * as ss from '@shared/styles';

import {
  VERSION_GRAPH_NODE_HEIGHT,
  VERSION_GRAPH_NODE_WIDTH,
  VERSION_GRAPH_PILL_HEIGHT,
} from '../lib/buildVersionGraph';
import type { AppReleaseKind } from '../model/types';

export const VersionButton = styled.Pressable`
  width: 100%;
  min-height: ${({ theme }) => ss.px(theme.control.height.lg)};

  flex-direction: row;
  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.md)};

  padding-horizontal: ${({ theme }) => ss.px(theme.spacing.lg)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => ss.px(theme.radius.lg)};

  background-color: ${({ theme }) => theme.colors.card};
`;

export const VersionButtonIcon = styled.View`
  width: 30px;
  height: 30px;

  align-items: center;
  justify-content: center;

  border-radius: ${({ theme }) => ss.px(theme.radius.full)};

  background-color: ${({ theme }) => theme.colors.input};
`;

export const VersionButtonText = styled.Text`
  flex: 1;

  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => ss.px(theme.size.md)};
  font-weight: ${({ theme }) => theme.weight.bold};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.lg)};
`;

export const getVersionButtonStyle = ({
  pressed,
}: PressableStateCallbackType): ViewStyle => ({
  opacity: pressed ? 0.72 : 1,
});

export const ModalRoot = styled.View`
  flex: 1;
`;

export const ModalHeader = styled.View`
  flex-direction: row;
  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};

  padding-bottom: ${({ theme }) => ss.px(theme.spacing.md)};
`;

export const ModalHeaderCopy = styled.View`
  flex: 1;
  min-width: 0;
`;

export const ModalTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => ss.px(theme.size.lg)};
  font-weight: ${({ theme }) => theme.weight.bold};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.xl)};
`;

export const ModalSubtitle = styled.Text`
  margin-top: ${({ theme }) => ss.px(theme.spacing.xs)};

  color: ${({ theme }) => theme.colors.muted};

  font-size: ${({ theme }) => ss.px(theme.size.sm)};
  font-weight: ${({ theme }) => theme.weight.regular};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.sm)};
`;

export const ModalScroll = styled.ScrollView`
  flex: 1;
`;

export const modalScrollContentStyle: ViewStyle = {
  paddingBottom: 8,
};

export const GraphCanvas = styled.View`
  position: relative;

  width: 100%;

  overflow: hidden;

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => ss.px(theme.radius.lg)};

  background-color: ${({ theme }) => theme.colors.card};
`;

export const getGraphCanvasStyle = (height: number): ViewStyle => ({
  height,
});

export const getGraphLineColor = (
  theme: Theme,
  kind: AppReleaseKind
): string => {
  if (kind === 'major') {
    return theme.colors.primary;
  }

  if (kind === 'minor') {
    return theme.colors.success;
  }

  return theme.colors.muted;
};

export const VersionNode = styled.Pressable<{
  $left: number;
  $top: number;
}>`
  position: absolute;

  left: ${({ $left }) => ss.px($left - VERSION_GRAPH_NODE_WIDTH / 2)};
  top: ${({ $top }) => ss.px($top - VERSION_GRAPH_NODE_HEIGHT / 2)};

  width: ${ss.px(VERSION_GRAPH_NODE_WIDTH)};
  height: ${ss.px(VERSION_GRAPH_NODE_HEIGHT)};

  align-items: center;
  justify-content: center;
`;

export const VersionNodePill = styled.View`
  min-width: 58px;
  height: ${ss.px(VERSION_GRAPH_PILL_HEIGHT)};

  align-items: center;
  justify-content: center;

  padding-horizontal: ${({ theme }) => ss.px(theme.spacing.md)};

  border-width: ${({ theme }) => ss.px(theme.border.width.md)};
  border-radius: ${({ theme }) => ss.px(theme.radius.full)};
`;

export const VersionNodeText = styled.Text`
  font-size: ${({ theme }) => ss.px(theme.size.base)};
  font-weight: ${({ theme }) => theme.weight.bold};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.md)};
`;

export const VersionNodeDate = styled.Text<{
  $side: 'left' | 'right';
}>`
  position: absolute;

  top: 15px;

  width: 100px;

  ${({ $side, theme }) =>
    $side === 'left'
      ? `right: ${ss.px(VERSION_GRAPH_NODE_WIDTH + theme.spacing.sm)};`
      : `left: ${ss.px(VERSION_GRAPH_NODE_WIDTH + theme.spacing.sm)};`}

  color: ${({ theme }) => theme.colors.muted};

  font-size: ${({ theme }) => ss.px(theme.size.xs)};
  font-weight: ${({ theme }) => theme.weight.medium};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.xs)};

  text-align: ${({ $side }) => ($side === 'left' ? 'right' : 'left')};
`;

const getKindBackgroundColor = (theme: Theme, kind: AppReleaseKind): string => {
  if (kind === 'major') {
    return theme.colors.shades.primary.md;
  }

  if (kind === 'minor') {
    return theme.colors.shades.success.md;
  }

  return theme.colors.input;
};

const getKindBorderColor = (theme: Theme, kind: AppReleaseKind): string => {
  if (kind === 'major') {
    return theme.colors.shades.primary.lg;
  }

  if (kind === 'minor') {
    return theme.colors.shades.success.lg;
  }

  return theme.colors.border;
};

const getKindTextColor = (theme: Theme, kind: AppReleaseKind): string => {
  if (kind === 'major') {
    return theme.colors.shades.primary.text;
  }

  if (kind === 'minor') {
    return theme.colors.shades.success.text;
  }

  return theme.colors.muted;
};

const getKindAccentColor = (theme: Theme, kind: AppReleaseKind): string => {
  if (kind === 'major') {
    return theme.colors.primary;
  }

  if (kind === 'minor') {
    return theme.colors.success;
  }

  return theme.colors.muted;
};

export const getVersionNodePillStyle = (
  theme: Theme,
  kind: AppReleaseKind,
  current: boolean
): ViewStyle => ({
  backgroundColor: getKindBackgroundColor(theme, kind),
  borderColor: getKindBorderColor(theme, kind),
  shadowColor: current ? getKindAccentColor(theme, kind) : theme.colors.black,
  shadowOffset: {
    width: 0,
    height: current ? 4 : 2,
  },
  shadowOpacity: current ? 0.22 : 0.1,
  shadowRadius: current ? 8 : 4,
  elevation: current ? 4 : 2,
});

export const getVersionNodeTextStyle = (
  theme: Theme,
  kind: AppReleaseKind
): TextStyle => ({
  color: getKindTextColor(theme, kind),
});

export const DetailsRoot = styled.View`
  gap: ${({ theme }) => ss.px(theme.spacing.lg)};
`;

export const ReleaseHero = styled.View`
  flex-direction: row;
  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.md)};

  padding: ${({ theme }) => ss.px(theme.spacing.lg)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-color: ${({ theme }) => theme.colors.shades.primary.lg};
  border-radius: ${({ theme }) => ss.px(theme.radius.lg)};

  background-color: ${({ theme }) => theme.colors.shades.primary.sm};
`;

export const ReleaseBadge = styled.View`
  min-width: 64px;
  height: 64px;

  align-items: center;
  justify-content: center;

  padding-horizontal: ${({ theme }) => ss.px(theme.spacing.md)};

  border-radius: ${({ theme }) => ss.px(theme.radius.full)};
`;

export const ReleaseBadgeText = styled.Text`
  font-size: ${({ theme }) => ss.px(theme.size.md)};
  font-weight: ${({ theme }) => theme.weight.bold};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.lg)};
`;

export const getReleaseBadgeStyle = (
  theme: Theme,
  kind: AppReleaseKind
): ViewStyle => ({
  backgroundColor: getKindBackgroundColor(theme, kind),
  borderColor: getKindBorderColor(theme, kind),
  borderWidth: theme.border.width.md,
});

export const getReleaseBadgeTextStyle = (
  theme: Theme,
  kind: AppReleaseKind
): TextStyle => ({
  color: getKindTextColor(theme, kind),
});

export const ReleaseHeroCopy = styled.View`
  flex: 1;
  min-width: 0;
`;

export const ReleaseTitleRow = styled.View`
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const ReleaseTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => ss.px(theme.size.lg)};
  font-weight: ${({ theme }) => theme.weight.bold};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.xl)};
`;

export const CurrentBadge = styled.View`
  padding-horizontal: ${({ theme }) => ss.px(theme.spacing.sm)};
  padding-vertical: ${({ theme }) => ss.px(theme.spacing.xs)};

  border-radius: ${({ theme }) => ss.px(theme.radius.full)};

  background-color: ${({ theme }) => theme.colors.shades.success.md};
`;

export const CurrentBadgeText = styled.Text`
  color: ${({ theme }) => theme.colors.shades.success.text};

  font-size: ${({ theme }) => ss.px(theme.size.xs)};
  font-weight: ${({ theme }) => theme.weight.bold};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.xs)};
`;

export const ReleaseDateLabel = styled.Text`
  margin-top: ${({ theme }) => ss.px(theme.spacing.sm)};

  color: ${({ theme }) => theme.colors.muted};

  font-size: ${({ theme }) => ss.px(theme.size.xs)};
  font-weight: ${({ theme }) => theme.weight.medium};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.xs)};
`;

export const ReleaseDate = styled.Text`
  margin-top: ${({ theme }) => ss.px(theme.spacing.xs)};

  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => ss.px(theme.size.sm)};
  font-weight: ${({ theme }) => theme.weight.bold};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.sm)};
`;

export const ReleaseSummary = styled.Text`
  margin-top: ${({ theme }) => ss.px(theme.spacing.sm)};

  color: ${({ theme }) => theme.colors.muted};

  font-size: ${({ theme }) => ss.px(theme.size.sm)};
  font-weight: ${({ theme }) => theme.weight.regular};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.sm)};
`;

export const ChangesTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => ss.px(theme.size.md)};
  font-weight: ${({ theme }) => theme.weight.bold};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.lg)};
`;

export const ChangeList = styled.View`
  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const ChangeCard = styled.View`
  flex-direction: row;

  gap: ${({ theme }) => ss.px(theme.spacing.md)};

  padding: ${({ theme }) => ss.px(theme.spacing.md)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => ss.px(theme.radius.lg)};

  background-color: ${({ theme }) => theme.colors.card};
`;

export const ChangeIcon = styled.View`
  width: 42px;
  height: 42px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme }) => theme.colors.shades.primary.sm};
`;

export const ChangeCopy = styled.View`
  flex: 1;
  min-width: 0;
`;

export const ChangeTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => ss.px(theme.size.base)};
  font-weight: ${({ theme }) => theme.weight.bold};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.md)};
`;

export const ChangeDescription = styled.Text`
  margin-top: ${({ theme }) => ss.px(theme.spacing.xs)};

  color: ${({ theme }) => theme.colors.muted};

  font-size: ${({ theme }) => ss.px(theme.size.sm)};
  font-weight: ${({ theme }) => theme.weight.regular};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.sm)};
`;
