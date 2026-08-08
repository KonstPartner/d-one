import styled, { css } from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { ViewStyle } from 'react-native';

import * as ss from '@shared/styles';

export const ManagerContainer = (theme: Theme) =>
  css`
    ${ss.InsetX(theme, 'sm')};
  ` as ViewStyle;

export const AnimatedWrap = css`
  ${ss.FullWidth};

  max-width: 500px;
` as ViewStyle;

export const ToastWrapper = styled.Pressable`
  ${ss.FullWidth};
`;

export const Container = styled.View`
  ${ss.FullWidth};

  ${({ theme }) => ss.Surface(theme, 'background')};
  ${({ theme }) => ss.Rounded(theme, 'md')};

  align-self: stretch;

  flex-direction: row;
  align-items: stretch;

  overflow: hidden;
`;

export const Stripe = (theme: Theme, accent: string) =>
  css`
    width: ${theme.spacing.sm}px;

    background-color: ${accent};
  ` as ViewStyle;

export const Content = styled.View`
  ${({ theme }) => ss.Inset(theme, 'md')};

  flex: 1;
`;

export const HeaderRow = styled.View`
  ${({ theme }) => ss.Row(theme, 'center', 'space-between', 'sm')};
`;

export const TitleRow = styled.View`
  ${ss.FlexItem};

  ${({ theme }) => ss.Row(theme, 'center', 'flex-start', 'sm')};
`;

export const Title = styled.Text`
  ${({ theme }) => ss.Text(theme, 'md', 'heavy', 'default', 'md')};

  flex: 1;
  min-width: 0px;
`;

export const Message = styled.Text`
  ${({ theme }) => ss.Body(theme)};

  margin-top: ${({ theme }) => theme.spacing.sm}px;
`;

export const CloseButton = styled.Pressable`
  ${ss.CenterContent};
`;

export const ProgressTrack = styled.View`
  ${ss.FullWidth};

  ${({ theme }) => ss.Rounded(theme, 'full')};

  height: ${({ theme }) => theme.spacing.xs}px;

  margin-top: ${({ theme }) => theme.spacing.md}px;

  background-color: ${({ theme }) => theme.colors.card};

  overflow: hidden;
`;

export const ProgressFill = (theme: Theme, accent: string) =>
  css`
    ${ss.Rounded(theme, 'full')};

    height: ${theme.spacing.xs}px;

    background-color: ${accent};
  ` as ViewStyle;
