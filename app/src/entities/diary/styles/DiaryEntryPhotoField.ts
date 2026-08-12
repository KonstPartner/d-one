import styled from '@emotion/native';
import type { ImageStyle } from 'react-native';

import * as ss from '@shared/styles';

type DisabledProps = {
  $disabled: boolean;
};

export const Root = styled.View<DisabledProps>`
  flex: 1;

  width: 100%;

  min-width: 0;
  min-height: 0;

  opacity: ${({ $disabled }) => ($disabled ? 0.55 : 1)};
`;

export const Preview = styled.View`
  position: relative;

  flex: 1;

  width: 100%;
  height: 100%;

  overflow: hidden;

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-color: ${({ theme }) => theme.colors.border};

  border-radius: ${({ theme }) => ss.px(theme.radius.lg)};

  background-color: ${({ theme }) => theme.colors.input};
`;

export const imageStyle: ImageStyle = {
  width: '100%',
  height: '100%',
};

export const EditButton = styled.Pressable`
  position: absolute;

  top: 50%;
  left: 50%;

  width: ${ss.px(50)};
  height: ${ss.px(50)};

  align-items: center;
  justify-content: center;

  margin-top: ${ss.px(-25)};
  margin-left: ${ss.px(-25)};

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-color: ${({ theme }) => theme.colors.card};

  border-radius: ${ss.px(25)};

  background-color: ${({ theme }) => theme.colors.text};
`;

export const DeleteButton = styled.Pressable`
  position: absolute;

  top: ${({ theme }) => ss.px(theme.spacing.xs)};
  right: ${({ theme }) => ss.px(theme.spacing.xs)};

  width: ${ss.px(32)};
  height: ${ss.px(32)};

  align-items: center;
  justify-content: center;

  border-width: ${({ theme }) => ss.px(theme.border.width.sm)};
  border-color: ${({ theme }) => theme.colors.card};

  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme }) => theme.colors.text};
`;

export const LoadingOverlay = styled.View`
  position: absolute;

  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  align-items: center;
  justify-content: center;

  background-color: ${({ theme }) => theme.colors.card};
`;
