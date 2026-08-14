import styled from '@emotion/native';

import * as ss from '@shared/styles';

type SegmentStateProps = {
  $active: boolean;
  $disabled: boolean;
};

export const Wrapper = styled.View`
  ${ss.FullWidth};

  align-items: stretch;

  gap: ${({ theme }) => ss.px(theme.spacing.xs)};
`;

export const Label = styled.Text`
  ${({ theme }) => ss.Text(theme, 'base', 'medium', 'muted', 'md')};

  text-align: center;
`;

export const Container = styled.View`
  ${({ theme }) => ss.Rounded(theme, 'lg')};

  min-height: ${({ theme }) => ss.px(theme.control.height.md)};

  flex-direction: row;
  align-items: stretch;

  gap: ${({ theme }) => ss.px(theme.spacing.xs)};

  padding: ${({ theme }) => ss.px(theme.spacing.xs)};
`;

export const Segment = styled.Pressable<SegmentStateProps>`
  flex: 1;
  flex-basis: 0px;

  min-width: 0;

  min-height: ${({ theme }) => ss.px(theme.control.height.sm)};

  align-items: center;
  justify-content: center;

  padding-horizontal: ${({ theme }) => ss.px(theme.spacing.sm)};

  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : 'transparent'};

  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
`;

export const SegmentText = styled.Text<SegmentStateProps>`
  ${({ theme }) => ss.Text(theme, 'sm', 'bold', 'default', 'md')};

  flex-shrink: 1;

  color: ${({ theme, $active }) =>
    $active ? theme.colors.white : theme.colors.text};

  text-align: center;
  text-align-vertical: center;

  include-font-padding: false;

  opacity: ${({ $disabled }) => ($disabled ? 0.75 : 1)};
`;
