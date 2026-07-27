import { StyleProp, TextStyle, ViewStyle as ViewStyleProp } from 'react-native';
import { css } from '@emotion/native';
import { Theme } from '@emotion/react';

import { toPX } from '@features/theme/model';

export const Wrapper = css`
  width: 100%;
` as StyleProp<ViewStyleProp>;

export const Field = (theme: Theme) =>
  css`
    flex: 1;
    padding: 12px 12px;
    border-radius: ${toPX(theme.radius.md)};
    border-width: 1px;
    border-color: ${theme.colors.border};
    background-color: ${theme.colors.input};
  ` as StyleProp<ViewStyleProp>;

export const FieldLabel = (theme: Theme) =>
  css`
    color: ${theme.colors.muted};
    font-size: 12px;
    font-weight: 700;
    margin-bottom: 6px;
  ` as StyleProp<TextStyle>;

export const FieldValue = (theme: Theme) =>
  css`
    color: ${theme.colors.text};
    font-size: 14px;
    font-weight: 700;
  ` as StyleProp<TextStyle>;

export const Chevron = (theme: Theme) =>
  css`
    color: ${theme.colors.muted};
    font-size: 14px;
    font-weight: 900;
    margin-left: 10px;
  ` as StyleProp<TextStyle>;

export const ApplyButton = (theme: Theme) =>
  css`
    width: 44px;
    align-items: center;
    justify-content: center;
    border-radius: ${toPX(theme.radius.md)};
    background-color: ${theme.colors.primary};
  ` as StyleProp<ViewStyleProp>;

export const ApplyButtonText = css`
  color: #ffffff;
  font-size: 18px;
  font-weight: 900;
` as StyleProp<TextStyle>;

export const Backdrop = css`
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.35);
  justify-content: center;
  align-items: center;
  padding: 16px;
` as StyleProp<ViewStyleProp>;

export const ModalCard = (theme: Theme) =>
  css`
    width: 100%;
    max-width: 420px;
    border-radius: ${toPX(theme.radius.lg)};
    background-color: ${theme.colors.bg};
    border-width: 1px;
    border-color: ${theme.colors.border};
    padding: 16px;
  ` as StyleProp<ViewStyleProp>;

export const ModalTitle = (theme: Theme) =>
  css`
    color: ${theme.colors.text};
    font-size: 18px;
    font-weight: 800;
  ` as StyleProp<TextStyle>;

export const ModalList = css`
  margin-top: 12px;
  gap: 10px;
` as StyleProp<ViewStyleProp>;

export const ModalItem = (theme: Theme) =>
  css`
    padding: 12px;
    border-radius: ${toPX(theme.radius.md)};
    border-width: 1px;
    border-color: ${theme.colors.border};
    background-color: ${theme.colors.bg};
  ` as StyleProp<ViewStyleProp>;

export const ModalItemSelected = (theme: Theme) =>
  css`
    border-color: ${theme.colors.primary};
  ` as StyleProp<ViewStyleProp>;

export const ModalItemText = (theme: Theme) =>
  css`
    color: ${theme.colors.text};
    font-size: 14px;
    font-weight: 700;
  ` as StyleProp<TextStyle>;

export const ModalItemTextSelected = (theme: Theme) =>
  css`
    color: ${theme.colors.primary};
  ` as StyleProp<TextStyle>;

export const Check = (theme: Theme) =>
  css`
    color: ${theme.colors.primary};
    font-size: 16px;
    font-weight: 900;
  ` as StyleProp<TextStyle>;

export const CheckPlaceholder = css`
  width: 16px;
  height: 16px;
` as StyleProp<ViewStyleProp>;

export const CancelButton = (theme: Theme) =>
  css`
    margin-top: 14px;
    padding: 12px;
    border-radius: ${toPX(theme.radius.md)};
    background-color: ${theme.colors.muted};
    align-items: center;
    justify-content: center;
  ` as StyleProp<ViewStyleProp>;

export const CancelButtonText = css`
  color: #ffffff;
  font-size: 14px;
  font-weight: 800;
` as StyleProp<TextStyle>;
