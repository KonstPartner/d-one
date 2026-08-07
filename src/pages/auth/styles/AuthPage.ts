import { StyleSheet } from 'react-native';
import styled from '@emotion/native';

export const PageScroll = styled.ScrollView`
  flex: 1;
`;

export const PageBody = styled.View`
  flex: 1;
  justify-content: center;

  padding-top: ${({ theme }) => theme.spacing.lg}px;
  padding-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

export const VerificationContent = styled.View`
  width: 100%;
  gap: ${({ theme }) => theme.spacing.lg}px;
`;

export const scrollContent = StyleSheet.create({
  root: {
    flexGrow: 1,
  },
}).root;
