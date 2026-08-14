import styled from '@emotion/native';

import * as ss from '@shared/styles';

type DisabledProps = {
  $disabled: boolean;
};

type ActiveProps = {
  $active: boolean;
};

type OpenedProps = {
  $opened: boolean;
};

export const SectionCard = styled.View`
  ${({ theme }) => ss.Shadow(theme, 'soft')};

  padding: ${({ theme }) => ss.px(theme.spacing.md)};
`;

export const SectionHeader = styled.View`
  flex-direction: row;

  align-items: center;
  justify-content: space-between;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};

  margin-bottom: ${({ theme }) => ss.px(theme.spacing.md)};
`;

export const SectionTitle = styled.Text`
  ${({ theme }) => ss.Subheading(theme)};
`;

export const SectionTitleWithGap = styled.Text`
  ${({ theme }) => ss.Subheading(theme)};

  margin-bottom: ${({ theme }) => ss.px(theme.spacing.md)};
`;

export const TextAction = styled.Pressable<DisabledProps>`
  min-height: ${({ theme }) => ss.px(theme.control.height.sm)};

  justify-content: center;

  padding-horizontal: ${({ theme }) => ss.px(theme.spacing.sm)};

  opacity: ${({ $disabled }) => ($disabled ? 0.38 : 1)};
`;

export const TextActionLabel = styled.Text<DisabledProps>`
  ${({ theme }) => ss.Caption(theme)};

  color: ${({ theme, $disabled }) =>
    $disabled ? theme.colors.muted : theme.colors.primary};

  font-weight: ${({ theme }) => theme.weight.bold};
`;

export const DateBoundaries = styled.View`
  flex-direction: row;

  align-items: stretch;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};

  margin-bottom: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const DateBoundary = styled.View<ActiveProps>`
  min-height: ${ss.px(52)};

  flex: 1;
  flex-basis: 0;

  flex-direction: row;
  align-items: center;

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};

  border-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.border};

  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.shades.primary.sm : theme.colors.input};
`;

export const DateBoundaryMain = styled.Pressable`
  flex: 1;

  min-width: 0;

  justify-content: center;

  gap: ${({ theme }) => ss.px(theme.spacing.xs)};

  padding: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const DateBoundaryLabel = styled.Text`
  ${({ theme }) => ss.Caption(theme)};

  color: ${({ theme }) => theme.colors.muted};

  font-weight: ${({ theme }) => theme.weight.bold};
`;

export const DateBoundaryValue = styled.Text`
  ${({ theme }) => ss.Body(theme)};

  color: ${({ theme }) => theme.colors.text};

  font-weight: ${({ theme }) => theme.weight.bold};
`;

export const ClearBoundaryButton = styled.Pressable`
  width: ${({ theme }) => ss.px(theme.control.height.sm)};

  height: ${({ theme }) => ss.px(theme.control.height.sm)};

  align-items: center;
  justify-content: center;

  margin-right: ${({ theme }) => ss.px(theme.spacing.xs)};
`;

export const DropdownField = styled.Pressable<OpenedProps>`
  min-height: ${({ theme }) => ss.px(theme.control.height.md)};

  flex-direction: row;

  align-items: center;
  justify-content: space-between;

  gap: ${({ theme }) => ss.px(theme.spacing.sm)};

  padding-horizontal: ${({ theme }) => ss.px(theme.spacing.md)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};

  border-color: ${({ theme, $opened }) =>
    $opened ? theme.colors.primary : theme.colors.border};

  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme }) => theme.colors.input};
`;

export const DropdownFieldText = styled.Text`
  ${({ theme }) => ss.Body(theme)};

  flex: 1;

  color: ${({ theme }) => theme.colors.text};
`;

export const CheckList = styled.View`
  gap: ${({ theme }) => ss.px(theme.spacing.xs)};

  margin-top: ${({ theme }) => ss.px(theme.spacing.sm)};
`;

export const CheckLabel = styled.Text`
  ${({ theme }) => ss.Body(theme)};

  flex: 1;

  color: ${({ theme }) => theme.colors.text};
`;
