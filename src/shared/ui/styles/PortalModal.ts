import { StyleSheet } from 'react-native';
import styled from '@emotion/native';
import type { Theme } from '@emotion/react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../Button';

export const Backdrop = styled.Pressable`
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
`;

export const Container = styled.View`
  position: absolute;
  inset: 0;

  align-items: stretch;

  width: 100%;
  max-width: 500px;

  margin: 0 auto;
`;

export const SafeArea = styled(SafeAreaView)`
  flex: 1;
`;

export const Sheet = styled.View`
  flex: 1;

  width: 100%;
  height: 100%;

  background-color: ${({ theme }) => theme.colors.bg};
`;

export const Scroll = styled.ScrollView`
  flex: 1;
`;

export const Content = styled.View`
  flex: 1;
`;

export const CloseButton = styled(Button)`
  min-height: ${({ theme }) => theme.control.height.md}px;

  align-items: center;
  justify-content: center;

  border-radius: ${({ theme }) => theme.radius.md}px;

  padding: ${({ theme }) => theme.spacing.md}px
    ${({ theme }) => theme.spacing.lg}px;

  background-color: ${({ theme }) => theme.colors.muted};

  color: ${({ theme }) => theme.colors.white};
`;

export const CloseButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.white};

  font-size: ${({ theme }) => theme.size.base}px;
  font-weight: ${({ theme }) => theme.weight.bold};
  line-height: ${({ theme }) => theme.lineHeight.md}px;

  text-align: center;
`;

export const getSheetStyle = (theme: Theme, withoutPadding: boolean) => ({
  padding: withoutPadding ? 0 : theme.spacing.lg,
});

export const getCloseButtonStyle = (theme: Theme, withoutPadding: boolean) => ({
  marginTop: theme.spacing.lg,

  ...(withoutPadding
    ? {
        marginHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
      }
    : null),
});

export const scrollContent = StyleSheet.create({
  root: {
    paddingBottom: 8,
  },
}).root;
