import { KeyboardAvoidingView } from 'react-native';
import type { ReactNode } from 'react';

import { PlatformOS } from '@shared/lib/platform';
import * as ss from '@shared/styles';

type KeyboardAvoidingContentProps = {
  children: ReactNode;
  keyboardVerticalOffset?: number;
};

export const KeyboardAvoidingContent = ({
  children,
  keyboardVerticalOffset = 0,
}: KeyboardAvoidingContentProps) => {
  if (PlatformOS.WEB) {
    return <>{children}</>;
  }

  return (
    <KeyboardAvoidingView
      style={ss.Flex}
      behavior={PlatformOS.IOS ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {children}
    </KeyboardAvoidingView>
  );
};
