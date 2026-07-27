import { FlexStyle } from 'react-native';
import { Theme } from '@emotion/react';

export type ThemeSpacing = keyof Theme['spacing'];
export type ThemeRadius = keyof Theme['radius'];
export type ThemeSize = keyof Theme['size'];
export type ThemeWeight = keyof Theme['weight'];
export type ThemeLineHeight = keyof Theme['lineHeight'];

export type SurfaceTone = 'card' | 'input' | 'background' | 'primarySoft';
export type ButtonTone =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'success'
  | 'ghost';
export type ControlSize = 'sm' | 'md' | 'lg';
export type TextTone =
  | 'default'
  | 'muted'
  | 'primary'
  | 'danger'
  | 'success'
  | 'warning'
  | 'inverse';

export type FlexDirection = NonNullable<FlexStyle['flexDirection']>;
export type FlexJustify = NonNullable<FlexStyle['justifyContent']>;
export type FlexAlign = NonNullable<FlexStyle['alignItems']>;

export type SurfaceShadowLevel = 'soft' | 'strong';
