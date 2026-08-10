import styled from '@emotion/native';

import * as ss from '@shared/styles';

export const Root = styled.View`
  flex: 1;

  gap: ${({ theme }) => ss.px(theme.spacing.md)};
`;

export const ToolbarArea = styled.View`
  flex-shrink: 0;
`;

export const SyncProgress = styled.View`
  ${({ theme }) => ss.Surface(theme, 'card')};

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

export const ListArea = styled.View`
  flex: 1;

  min-height: 0;
`;
