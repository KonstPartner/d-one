import styled from '@emotion/native';

import * as ss from '@shared/styles';

export const ItemSeparator = styled.View`
  height: ${({ theme }) => ss.px(theme.spacing.lg)};
`;

export const Footer = styled.View`
  padding-top: ${({ theme }) => ss.px(theme.spacing.lg)};

  padding-bottom: ${({ theme }) => ss.px(theme.spacing.xl)};
`;

export const Empty = styled.View`
  align-items: center;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};

  padding-vertical: ${({ theme }) => ss.px(theme.spacing['2xl'])};

  padding-horizontal: ${({ theme }) => ss.px(theme.spacing.lg)};
`;

export const EmptyTitle = styled.Text`
  ${({ theme }) => ss.Subheading(theme)};

  text-align: center;
`;

export const EmptyDescription = styled.Text`
  ${({ theme }) => ss.Body(theme)};

  color: ${({ theme }) => theme.colors.muted};

  text-align: center;
`;

export const SelectableEntry = styled.Pressable`
  flex-direction: row;

  align-items: flex-start;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

type SelectionIndicatorProps = {
  $selected: boolean;
};

export const SelectionIndicator = styled.View<SelectionIndicatorProps>`
  width: ${({ theme }) => ss.px(theme.control.height.sm)};

  height: ${({ theme }) => ss.px(theme.control.height.sm)};

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  margin-top: ${({ theme }) => ss.px(theme.spacing.sm)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};

  border-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary : theme.colors.border};

  border-radius: ${({ theme }) => ss.px(theme.radius.full)};

  background-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary : theme.colors.card};
`;

type EntryContentProps = {
  $selected: boolean;
};

export const EntryContent = styled.View<EntryContentProps>`
  flex: 1;

  border-width: ${({ theme, $selected }) =>
    ss.px($selected ? theme.border.width.md : 0)};

  border-color: ${({ theme }) => theme.colors.primary};

  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.shades.primary.sm : 'transparent'};
`;
