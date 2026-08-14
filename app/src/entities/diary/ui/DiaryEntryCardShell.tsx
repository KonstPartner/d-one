import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { PressableStateCallbackType } from 'react-native';

import * as s from '../styles/DiaryEntryCard';

type DiaryEntryCardShellProps = {
  children: ReactNode;

  testID?: string;

  disabled?: boolean;
  dimmed?: boolean;

  selectionActive?: boolean;
  selectionDisabled?: boolean;

  selected?: boolean;

  accessibilityLabel?: string;

  onPress?: () => void;

  onToggleSelection?: () => void;
};

type DiaryEntryCardBodyProps = {
  children: ReactNode;

  selectionActive?: boolean;
};

export const DiaryEntryCardShell = ({
  children,

  testID,

  disabled = false,
  dimmed = false,

  selectionActive = false,
  selectionDisabled = false,

  selected = false,

  accessibilityLabel,

  onPress,

  onToggleSelection,
}: DiaryEntryCardShellProps) => {
  const theme = useTheme();

  const { t } = useTranslation();

  const regularInteractive =
    !selectionActive && onPress !== undefined && !disabled;

  const selectionInteractive =
    selectionActive && onToggleSelection !== undefined && !selectionDisabled;

  const interactive = selectionActive
    ? selectionInteractive
    : regularInteractive;

  const handlePress = selectionActive ? onToggleSelection : onPress;

  return (
    <s.Card
      testID={testID}
      $selected={selected}
      disabled={!interactive}
      accessibilityRole={
        selectionActive
          ? 'checkbox'
          : onPress !== undefined
            ? 'button'
            : undefined
      }
      accessibilityLabel={
        selectionActive
          ? t('diary.selection.entryAccessibilityLabel')
          : onPress !== undefined
            ? accessibilityLabel
            : undefined
      }
      accessibilityState={
        selectionActive
          ? {
              checked: selected,
              disabled: !selectionInteractive,
            }
          : onPress !== undefined
            ? {
                disabled: !regularInteractive,
              }
            : undefined
      }
      onPress={interactive ? handlePress : undefined}
      style={({ pressed }: PressableStateCallbackType) => ({
        opacity: dimmed ? 0.5 : pressed && interactive ? 0.72 : 1,
      })}
    >
      {selectionActive ? (
        <s.SelectionIndicator $selected={selected} pointerEvents="none">
          {selected ? (
            <Ionicons
              name="checkmark"
              size={theme.size.md}
              color={theme.colors.white}
            />
          ) : null}
        </s.SelectionIndicator>
      ) : null}

      {children}
    </s.Card>
  );
};

export const DiaryEntryCardBody = ({
  children,

  selectionActive = false,
}: DiaryEntryCardBodyProps) => (
  <s.Body $selectionActive={selectionActive}>{children}</s.Body>
);
