import styled from '@emotion/native';

import * as ss from '@shared/styles';

export const Content = styled.View`
  flex: 1;
  min-height: 0px;

  width: 100%;

  gap: ${({ theme }) => ss.px(theme.spacing.md)};
`;

export const Selector = styled.View`
  z-index: 2;

  padding-top: ${({ theme }) => ss.px(theme.spacing.md)};
`;

export const Diary = styled.View`
  flex: 1;
  min-height: 0px;

  z-index: 1;
`;

export const State = styled.View`
  flex: 1;

  align-items: center;
  justify-content: center;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};

  padding-horizontal: ${({ theme }) => ss.px(theme.spacing.lg)};
`;

export const StateTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => ss.px(theme.size.md)};

  font-weight: ${({ theme }) => theme.weight.semibold};

  line-height: ${({ theme }) => ss.px(theme.lineHeight.lg)};

  text-align: center;
`;

export const StateDescription = styled.Text`
  color: ${({ theme }) => theme.colors.muted};

  font-size: ${({ theme }) => ss.px(theme.size.base)};

  font-weight: ${({ theme }) => theme.weight.regular};

  line-height: ${({ theme }) => ss.px(theme.lineHeight.md)};

  text-align: center;
`;
