import { KeyboardAvoidingView, type ViewStyle } from 'react-native';
import styled, { css } from '@emotion/native';
import type { Theme } from '@emotion/react';
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
  ${ss.FullWidth};

  height: 100%;
`;

export const KeyboardAware = styled(KeyboardAvoidingView)`
  flex: 1;
`;

export const Scroll = styled.ScrollView`
  flex: 1;
`;

export const Content = styled.View`
  flex: 1;
`;

export const CloseButton = styled(Button)`
  padding-top: ${({ theme }) => theme.spacing.md}px;
  padding-bottom: ${({ theme }) => theme.spacing.md}px;

  background-color: ${({ theme }) => theme.colors.muted};
`;

export const CloseButtonText = styled.Text`
  ${({ theme }) => ss.Text(theme, 'base', 'bold', 'inverse', 'md')};

  text-align: center;
`;

export const getSheetStyle = (theme: Theme, withoutPadding: boolean) =>
  css`
    padding: ${withoutPadding ? 0 : theme.spacing.lg}px;
  ` as ViewStyle;

export const getCloseButtonStyle = (theme: Theme, withoutPadding: boolean) =>
  css`
    margin-top: ${theme.spacing.lg}px;

    ${withoutPadding
      ? `
        margin-left: ${theme.spacing.lg}px;
        margin-right: ${theme.spacing.lg}px;
        margin-bottom: ${theme.spacing.lg}px;
      `
      : ''}
  ` as ViewStyle;

export const scrollContent = css`
  padding-bottom: 8px;
` as ViewStyle;
