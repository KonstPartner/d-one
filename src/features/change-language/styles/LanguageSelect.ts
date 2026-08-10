import styled from '@emotion/native';
import type { Theme } from '@emotion/react';
import type { TextStyle, ViewStyle } from 'react-native';

import * as ss from '@shared/styles';

export const Wrapper = styled.View`
  width: 100%;
`;

export const FieldRow = styled.View`
  width: 100%;

  flex-direction: row;
  align-items: stretch;

  gap: 10px;
`;

export const Field = styled.Pressable`
  flex: 1;

  padding: 12px;

  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme }) => theme.colors.input};
`;

export const FieldLabel = styled.Text`
  margin-bottom: 6px;

  color: ${({ theme }) => theme.colors.muted};

  font-size: 12px;
  font-weight: 700;
`;

export const FieldValueRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const FieldValue = styled.Text`
  flex: 1;

  color: ${({ theme }) => theme.colors.text};

  font-size: 14px;
  font-weight: 700;
`;

export const Chevron = styled.Text`
  margin-left: 10px;

  color: ${({ theme }) => theme.colors.muted};

  font-size: 14px;
  font-weight: 900;
`;

export const ApplyButton = styled.Pressable`
  width: 44px;

  align-items: center;
  justify-content: center;

  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme }) => theme.colors.primary};
`;

export const ApplyButtonText = styled.Text`
  color: #ffffff;

  font-size: 18px;
  font-weight: 900;
`;

export const Backdrop = styled.Pressable`
  position: absolute;
  inset: 0;

  align-items: center;
  justify-content: center;

  padding: 16px;

  background-color: rgba(0, 0, 0, 0.35);
`;

export const ModalCard = styled.Pressable`
  width: 100%;
  max-width: 420px;

  padding: 16px;

  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => ss.px(theme.radius.lg)};

  background-color: ${({ theme }) => theme.colors.bg};
`;

export const ModalTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};

  font-size: 18px;
  font-weight: 800;
`;

export const ModalList = styled.View`
  margin-top: 12px;
  gap: 10px;
`;

export const ModalItem = styled.Pressable`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  padding: 12px;

  border-width: 1px;
  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme }) => theme.colors.bg};
`;

export const ModalItemText = styled.Text`
  font-size: 14px;
  font-weight: 700;
`;

export const getModalItemStyle = (
  theme: Theme,
  selected: boolean
): ViewStyle => ({
  borderColor: selected ? theme.colors.primary : theme.colors.border,
});

export const getModalItemTextStyle = (
  theme: Theme,
  selected: boolean
): TextStyle => ({
  color: selected ? theme.colors.primary : theme.colors.text,
});

export const Check = styled.Text`
  color: ${({ theme }) => theme.colors.primary};

  font-size: 16px;
  font-weight: 900;
`;

export const CheckPlaceholder = styled.View`
  width: 16px;
  height: 16px;
`;

export const CancelButton = styled.Pressable`
  margin-top: 14px;

  align-items: center;
  justify-content: center;

  padding: 12px;

  border-radius: ${({ theme }) => ss.px(theme.radius.md)};

  background-color: ${({ theme }) => theme.colors.muted};
`;

export const CancelButtonText = styled.Text`
  color: #ffffff;

  font-size: 14px;
  font-weight: 800;
`;

export const getApplyButtonStyle = (disabled: boolean): ViewStyle => ({
  opacity: disabled ? 0.55 : 1,
});
