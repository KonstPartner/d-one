import { KeyboardAvoidingView } from 'react-native';
import styled from '@emotion/native';
import type { ReactNode } from 'react';

import { PlatformOS } from '@shared/lib/platform';

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
    <Root
      behavior={PlatformOS.IOS ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {children}
    </Root>
  );
};

const Root = styled(KeyboardAvoidingView)`
  flex: 1;
`;
