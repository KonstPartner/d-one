import styled from '@emotion/native';
import { Image as ExpoImage } from 'expo-image';

import * as ss from '@shared/styles';

type FrameProps = {
  $interactive: boolean;
};

export const Frame = styled.Pressable<FrameProps>`
  position: relative;

  width: 100%;

  aspect-ratio: 1.7777778;

  overflow: hidden;

  border-radius: ${({ theme }) => ss.px(theme.radius.sm)};

  background-color: ${({ theme }) => theme.colors.bg};

  ${({ $interactive }) =>
    $interactive
      ? `
            &:active {
              opacity: 0.85;
            }
          `
      : ''}
`;

export const Image = styled(ExpoImage)`
  width: 100%;
  height: 100%;
`;

export const CenteredOverlay = styled.View`
  position: absolute;

  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  align-items: center;
  justify-content: center;

  padding: ${({ theme }) => ss.px(theme.spacing.md)};

  background-color: ${({ theme }) => theme.colors.bg};
`;

export const FallbackText = styled.Text`
  ${({ theme }) => ss.Caption(theme)};

  margin-top: ${({ theme }) => ss.px(theme.spacing.sm)};

  text-align: center;
`;

export const Loader = styled.ActivityIndicator``;

export const Indicator = styled.View`
  position: absolute;

  top: ${({ theme }) => ss.px(theme.spacing.sm)};

  right: ${({ theme }) => ss.px(theme.spacing.sm)};

  align-items: center;
  justify-content: center;

  padding: ${({ theme }) => ss.px(theme.spacing.xs)};

  border-radius: ${({ theme }) => ss.px(theme.radius.full)};

  background-color: ${({ theme }) => theme.colors.blackAlpha.xl};
`;
