import styled from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { PressableStateCallbackType, ViewStyle } from 'react-native';

import * as ss from '@shared/styles';

export const Root = styled.View`
  width: 100%;
  flex: 1;

  gap: ${({ theme }) => ss.px(theme.spacing.md)};
`;

export const Header = styled.View`
  width: 100%;

  flex-direction: row;
  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.md)};
`;

export const Title = styled.Text`
  flex: 1;

  color: ${({ theme }) => theme.colors.text};

  text-align: center;
`;

export const SectionTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};

  padding-top: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const Card = styled.View`
  width: 100%;

  gap: ${({ theme }) => ss.px(theme.spacing.md)};

  padding: ${({ theme }) => ss.px(theme.spacing.md)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => ss.px(theme.radius.lg)};

  background-color: ${({ theme }) => theme.colors.card};
`;

export const FinishedFilePressable = styled.Pressable`
  width: 100%;
`;

export const FileMain = styled.View`
  width: 100%;

  flex-direction: row;
  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.md)};
`;

export const IconBox = styled.View`
  width: ${({ theme }) => ss.px(theme.control.height.md)};
  height: ${({ theme }) => ss.px(theme.control.height.md)};

  align-items: center;
  justify-content: center;

  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme }) => theme.colors.bg};
`;

export const FileInfo = styled.View`
  flex: 1;

  gap: ${({ theme }) => ss.px(theme.spacing.xs)};
`;

export const FileName = styled.Text`
  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => ss.px(theme.size.md)};
  font-weight: ${({ theme }) => theme.weight.bold};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.lg)};
`;

export const MetaText = styled.Text`
  color: ${({ theme }) => theme.colors.muted};

  font-size: ${({ theme }) => ss.px(theme.size.sm)};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.sm)};
`;

export const ProgressGroup = styled.View`
  gap: ${({ theme }) => ss.px(theme.spacing.xs)};
`;

export const ProgressText = styled.Text`
  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => ss.px(theme.size.sm)};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.sm)};
`;

export const Actions = styled.View`
  flex-direction: row;
  flex-wrap: wrap;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const PrimaryActionText = styled.Text`
  color: ${({ theme }) => theme.colors.white};
`;

export const FinishedActions = styled.View`
  align-items: flex-end;
`;

export const ErrorText = styled.Text`
  color: ${({ theme }) => theme.colors.danger};

  font-size: ${({ theme }) => ss.px(theme.size.sm)};
  line-height: ${({ theme }) => ss.px(theme.lineHeight.sm)};
`;

export const EmptyText = styled.Text`
  color: ${({ theme }) => theme.colors.muted};

  text-align: center;
`;

export const getFilePressableStyle = ({
  pressed,
}: PressableStateCallbackType): ViewStyle => ({
  opacity: pressed ? 0.7 : 1,
});

export const getListContentStyle = (
  theme: Theme,
  empty: boolean
): ViewStyle => ({
  flexGrow: empty ? 1 : 0,
  gap: theme.spacing.md,
  paddingBottom: theme.spacing.xl,
  justifyContent: empty ? 'center' : 'flex-start',
});
