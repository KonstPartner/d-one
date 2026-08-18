import styled, { css } from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import * as ss from '@shared/styles';

import { Button } from '../Button';

export const Backdrop = styled.Pressable`
  position: absolute;
  inset: 0;

  background-color: rgba(0, 0, 0, 0.5);
`;

export const Container = styled.View`
  ${ss.FullWidth};

  position: absolute;
  inset: 0;

  align-items: stretch;

  max-width: 500px;

  margin: 0 auto;
`;

export const SafeArea = styled(SafeAreaView)`
  flex: 1;
`;

export const Sheet = styled.View`
  ${({ theme }) => ss.PageRoot(theme)};

  height: 100%;
`;

export const Scroll = styled.ScrollView`
  flex: 1;
`;

export const Content = styled.View`
  flex: 1;
`;

export const CloseButton = styled(Button)`
  padding-top: ${({ theme }) => ss.px(theme.spacing.md)};
  padding-bottom: ${({ theme }) => ss.px(theme.spacing.md)};
  border-color: transparent;
  background-color: ${({ theme }) => theme.colors.muted};
`;

export const CloseButtonText = styled.Text`
  ${({ theme }) => ss.Text(theme, 'base', 'bold', 'inverse', 'md')};

  text-align: center;
`;

export const getSheetStyle = (theme: Theme, withoutPadding: boolean) =>
  css`
    padding: ${withoutPadding ? 0 : ss.px(theme.spacing.lg)};
  ` as ViewStyle;

export const getCloseButtonStyle = (theme: Theme, withoutPadding: boolean) =>
  css`
    margin-top: ${ss.px(theme.spacing.lg)};

    ${withoutPadding
      ? `
        margin-left: ${ss.px(theme.spacing.lg)};
        margin-right: ${ss.px(theme.spacing.lg)};
        margin-bottom: ${ss.px(theme.spacing.lg)};
      `
      : ''}
  ` as ViewStyle;

export const scrollContent = css`
  padding-bottom: 8px;
` as ViewStyle;
