import styled from '@emotion/native';

import * as ss from '@shared/styles';

export const Root = styled.View`
  gap: ${({ theme }) => ss.px(theme.spacing.md)};

  padding-vertical: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const Count = styled.Text``;

export const Actions = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const CloseView = styled.View`
  margin-left: auto;

  justify-content: center;
  align-items: center;
`;

export const ActionText = styled.Text`
  color: ${({ theme }) => theme.colors.text};
`;

export const DownloadText = styled.Text`
  color: ${({ theme }) => theme.colors.white};
`;
