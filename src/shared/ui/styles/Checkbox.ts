import styled from '@emotion/native';

import * as ss from '@shared/styles';

export const Root = styled.Pressable`
  flex-direction: row;
  align-items: center;

  gap: 10px;

  padding: 6px ${({ theme }) => ss.px(theme.spacing.md)};

  border-radius: 10px;
`;

export const Indicator = styled.View<{
  $checked: boolean;
}>`
  ${ss.CenterContent};

  width: 30px;
  height: 30px;

  border-width: ${({ theme }) => ss.px(theme.border.width.md)};
  border-color: ${({ theme, $checked }) =>
    $checked ? theme.colors.primary : theme.colors.border};

  border-radius: 2px;

  background-color: ${({ theme, $checked }) =>
    $checked ? theme.colors.primary : theme.colors.bg};
`;

export const Label = styled.Text`
  ${({ theme }) => ss.Body(theme)};
`;
