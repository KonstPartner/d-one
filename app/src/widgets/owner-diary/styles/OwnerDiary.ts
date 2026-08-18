import { Animated } from 'react-native';
import styled from '@emotion/native';

import * as ss from '@shared/styles';

export const Root = styled.View`
  flex: 1;
`;

export const ListArea = styled.View`
  flex: 1;

  min-height: 0;
`;

export const ToolbarOverlay = styled(Animated.View)`
  position: absolute;

  top: 0;
  left: 0;
  right: 0;

  z-index: 10;

  gap: ${({ theme }) => ss.px(theme.spacing.md)};

  padding-bottom: ${({ theme }) => ss.px(theme.spacing.md)};

  background-color: ${({ theme }) => theme.colors.bg};
`;

export const ToolbarArea = styled.View`
  flex-shrink: 0;
`;

export const SyncProgress = styled.View`
  ${({ theme }) => ss.Rounded(theme, 'md')};

  flex-shrink: 0;

  flex-direction: row;
  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};

  padding-horizontal: ${({ theme }) => ss.px(theme.spacing.md)};

  padding-vertical: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const SyncProgressText = styled.Text`
  ${({ theme }) => ss.Text(theme, 'sm', 'semibold')};

  flex: 1;
`;
