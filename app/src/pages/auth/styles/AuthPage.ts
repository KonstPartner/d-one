import { StyleSheet } from 'react-native';
import styled from '@emotion/native';

import * as ss from '@shared/styles';

export const PageScroll = styled.ScrollView`
  flex: 1;
  min-height: 0px;
`;

export const PageBody = styled.View`
  flex-grow: 1;
  flex-shrink: 0;

  justify-content: center;

  padding-top: ${({ theme }) => ss.px(theme.spacing.lg)};
  padding-bottom: ${({ theme }) => ss.px(theme.spacing.lg)};
`;

export const VerificationContent = styled.View`
  width: 100%;
  gap: ${({ theme }) => ss.px(theme.spacing.lg)};
`;

export const scrollContent = StyleSheet.create({
  root: {
    flexGrow: 1,
    paddingBottom: 150,
  },
}).root;
