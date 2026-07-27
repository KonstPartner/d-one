import { ReactNode } from 'react';
import { KeyboardAvoidingView } from 'react-native';

import { PlatformOS } from '@features/shared/model';

const AvoidKeyboardView = ({ children }: { children: ReactNode }) => {
  if (PlatformOS.WEB) {
    return children;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={PlatformOS.IOS ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {children}
    </KeyboardAvoidingView>
  );
};

export default AvoidKeyboardView;
