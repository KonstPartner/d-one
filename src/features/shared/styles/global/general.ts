import {
  RegisteredStyle,
  StyleProp,
  TextStyle as TextStyleProp,
  ViewStyle,
} from 'react-native';
import { css } from '@emotion/native';
import { Theme } from '@emotion/react';

import * as controls from '@features/shared/styles/global/controls';
import * as surfaces from '@features/shared/styles/global/surfaces';
import * as typography from '@features/shared/styles/global/typography';
import { toPX } from '@features/theme/model';

type LegacyActionStyle = StyleProp<ViewStyle> & StyleProp<TextStyleProp>;

export const PrimeLayer = css`
  position: relative;
  z-index: 10000;
  elevation: 30;
` as StyleProp<ViewStyle>;

export const Modal = css`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
` as StyleProp<ViewStyle>;

export const ModalBackdrop = (theme: Theme) =>
  css`
    background-color: ${theme.colors.blackAlpha.xl};
  ` as StyleProp<ViewStyle>;

export const ModalContent = (theme: Theme) =>
  [
    surfaces.Surface(theme, 'background'),
    surfaces.Rounded(theme, 'md'),
    surfaces.Inset(theme, 'sm'),
    css`
      width: 90%;
      max-width: 500px;
      gap: ${toPX(theme.spacing.md)};
    ` as StyleProp<ViewStyle>,
  ] as StyleProp<ViewStyle>;

export const ButtonStyles = (theme: Theme, disabled: boolean = false) =>
  controls.Button(theme, 'primary', disabled);

export const Link = (theme: Theme) =>
  typography.Text(theme, 'base', 'medium', 'primary');

export const TextWhite = css`
  color: #ffffff;
` as RegisteredStyle<TextStyleProp>;

export const TextInverse = (theme: Theme) =>
  typography.Text(theme, 'base', 'bold', 'inverse');

export const Delete = (theme: Theme, disabled: boolean = false) =>
  controls.Button(theme, 'danger', disabled) as LegacyActionStyle;

export const DangerText = (theme: Theme) =>
  typography.Text(theme, 'base', 'medium', 'danger');

export const Success = (theme: Theme) => controls.Button(theme, 'success');

export const MutedButton = (theme: Theme) =>
  css`
    min-height: ${toPX(theme.control.height.md)};
    border-radius: ${toPX(theme.radius.md)};
    padding: ${toPX(theme.spacing.md)} ${toPX(theme.spacing.lg)};
    align-items: center;
    justify-content: center;
    background-color: ${theme.colors.muted};
  ` as StyleProp<ViewStyle>;

export const Title = (theme: Theme) => typography.Heading(theme);

export const MediumTitle = (theme: Theme) => typography.Subheading(theme);

export const TextStyle = (theme: Theme) => typography.Body(theme);

export const MutedText = (theme: Theme) =>
  typography.Text(theme, 'base', 'regular', 'muted');

export const Divider = (theme: Theme) =>
  css`
    height: ${toPX(theme.border.width.sm)};
    background-color: ${theme.colors.border};
    opacity: 0.7;
  ` as StyleProp<ViewStyle>;
