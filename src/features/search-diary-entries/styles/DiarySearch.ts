import styled from '@emotion/native';

import * as ss from '@shared/styles';

type SearchOptionProps = {
  $selected: boolean;
  $backgroundColor: string;
  $borderColor: string;
};

type SearchOptionIconProps = {
  $backgroundColor: string;
  $borderColor: string;
};

type SearchOptionTextProps = {
  $selected: boolean;
  $color: string;
};

export const Root = styled.View`
  width: 100%;

  gap: ${({ theme }) => ss.px(theme.spacing.xs)};

  min-width: 0;
`;

export const TopRow = styled.View`
  width: 100%;

  flex-direction: row;
  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const InputShell = styled.View`
  min-height: ${({ theme }) => ss.px(theme.control.height.lg)};

  flex: 1;

  min-width: 0;

  flex-direction: row;
  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};

  padding-horizontal: ${({ theme }) => ss.px(theme.spacing.md)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};

  border-color: ${({ theme }) => theme.colors.border};

  border-radius: ${({ theme }) => ss.px(theme.radius.lg)};

  background-color: ${({ theme }) => theme.colors.input};
`;

export const Input = styled.TextInput`
  min-height: ${({ theme }) => ss.px(theme.control.height.lg)};

  flex: 1;

  min-width: 0;

  padding-vertical: 0;

  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => ss.px(theme.size.md)};
`;

export const ClearButton = styled.Pressable`
  width: ${({ theme }) => ss.px(theme.control.height.sm)};

  height: ${({ theme }) => ss.px(theme.control.height.sm)};

  align-items: center;
  justify-content: center;
`;

export const EndActions = styled.View`
  flex-direction: row;
  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const Row = styled.View`
  ${({ theme }) => ss.Row(theme, 'center')};
`;

export const SelectView = styled.View`
  flex: 1;
`;

export const Filter = styled.View`
  border-width: 1px;
  border-style: solid;

  border-color: ${({ theme }) => theme.colors.primary};

  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  padding: 10px;
`;

export const Add = styled.View`
  background-color: ${({ theme }) => theme.colors.primary};

  border-radius: ${({ theme }) => ss.px(theme.radius.full)};

  padding: 15px;
`;

export const SearchOption = styled.Pressable<SearchOptionProps>`
  width: 100%;

  min-height: 50px;

  flex-direction: row;

  align-items: center;
  justify-content: space-between;

  gap: 10px;

  padding: 7px 9px;

  border-width: ${({ theme, $selected }) =>
    ss.px($selected ? theme.border.width.md : theme.border.width.sm)};

  border-color: ${({ $borderColor }) => $borderColor};

  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ $backgroundColor }) => $backgroundColor};
`;

export const SearchOptionContent = styled.View`
  flex: 1;

  min-width: 0;

  flex-direction: row;
  align-items: center;

  gap: 10px;
`;

export const SearchOptionIcon = styled.View<SearchOptionIconProps>`
  width: 34px;
  height: 34px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};

  border-color: ${({ $borderColor }) => $borderColor};

  border-radius: ${({ theme }) => ss.px(theme.radius.full)};

  background-color: ${({ $backgroundColor }) => $backgroundColor};
`;

export const SearchOptionText = styled.Text<SearchOptionTextProps>`
  ${({ theme, $selected }) =>
    ss.Text(theme, 'base', $selected ? 'semibold' : 'medium', 'default', 'md')};

  flex: 1;

  min-width: 0;

  color: ${({ $color }) => $color};
`;

export const SearchOptionCheck = styled.View`
  width: 20px;
  height: 20px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;
`;
