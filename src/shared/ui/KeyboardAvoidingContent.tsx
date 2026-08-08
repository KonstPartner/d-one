import { type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';

type KeyboardAvoidingContentProps = {
  children: ReactNode;
  keyboardVerticalOffset?: number;
};

export const KeyboardAvoidingContent = ({
  children,
  keyboardVerticalOffset = 0,
}: KeyboardAvoidingContentProps) => {
  if (Platform.OS === 'web') {
    return <>{children}</>;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {children}
    </KeyboardAvoidingView>
  );
};
