import styled from '@emotion/native';

import * as ss from '@shared/styles';

type SegmentStateProps = {
  $active: boolean;
  $disabled: boolean;
};

export const Wrapper = styled.View`
  ${ss.FullWidth};

  align-items: center;

  gap: 5px;

  margin: 0 auto;
`;

export const Label = styled.Text`
  ${({ theme }) => ss.Text(theme, 'base', 'medium', 'muted', 'md')};
`;

export const Container = styled.View`
  ${ss.FullWidth};

  ${({ theme }) => ss.Surface(theme, 'input')};
  ${({ theme }) => ss.Rounded(theme, 'lg')};

  min-height: 40px;

  flex-direction: row;
  align-items: center;

  overflow: hidden;

  padding: ${({ theme }) => theme.spacing.xs}px;
`;

export const Segment = styled.Pressable<SegmentStateProps>`
  ${ss.CenterContent};

  ${({ theme }) => ss.Rounded(theme, 'lg')};

  flex: 1;

  min-height: ${({ theme }) => theme.control.height.sm}px;

  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : 'transparent'};

  opacity: ${({ $disabled }) => ($disabled ? 0.55 : 1)};
`;

export const SegmentText = styled.Text<SegmentStateProps>`
  ${({ theme }) => ss.Text(theme, 'md', 'bold', 'default', 'md')};

  color: ${({ theme, $active }) =>
    $active ? theme.colors.white : theme.colors.text};

  opacity: ${({ $disabled }) => ($disabled ? 0.75 : 1)};
`;
