import type { ReactNode } from 'react';
import type { PressableStateCallbackType } from 'react-native';

import * as s from '../styles/DiaryEntryCard';

type DiaryEntryCardShellProps = {
  children: ReactNode;

  testID?: string;

  disabled?: boolean;
  dimmed?: boolean;
  selected?: boolean;

  accessibilityLabel?: string;

  onPress?: () => void;
};

type DiaryEntryCardBodyProps = {
  children: ReactNode;
};

export const DiaryEntryCardShell = ({
  children,

  testID,

  disabled = false,
  dimmed = false,
  selected = false,

  accessibilityLabel,

  onPress,
}: DiaryEntryCardShellProps) => {
  const hasPressAction = onPress !== undefined;
  const interactive = hasPressAction && !disabled;

  return (
    <s.Card
      testID={testID}
      $selected={selected}
      disabled={!interactive}
      accessibilityRole={hasPressAction ? 'button' : undefined}
      accessibilityLabel={hasPressAction ? accessibilityLabel : undefined}
      accessibilityState={
        hasPressAction
          ? {
              disabled: !interactive,
              selected,
            }
          : undefined
      }
      onPress={interactive ? onPress : undefined}
      style={({ pressed }: PressableStateCallbackType) => ({
        opacity: dimmed ? 0.5 : pressed && interactive ? 0.72 : 1,
      })}
    >
      {children}
    </s.Card>
  );
};

export const DiaryEntryCardBody = ({ children }: DiaryEntryCardBodyProps) => (
  <s.Body>{children}</s.Body>
);
