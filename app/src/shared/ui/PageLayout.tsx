import { type StyleProp, type ViewStyle } from 'react-native';
import styled from '@emotion/native';
import type { PropsWithChildren } from 'react';
import { type Edges, SafeAreaView } from 'react-native-safe-area-context';

import { PlatformOS } from '@shared/lib/platform';
import * as ss from '@shared/styles';

import { KeyboardAvoidingContent } from './KeyboardAvoidingContent';

type PageLayoutProps = PropsWithChildren<{
  edges?: Edges;
  style?: StyleProp<ViewStyle>;
}>;

export const PageLayout = ({
  children,
  edges = ['right', 'left'],
  style,
}: PageLayoutProps) => {
  if (PlatformOS.WEB) {
    return (
      <PageRoot>
        <PageContent style={style}>{children}</PageContent>
      </PageRoot>
    );
  }

  return (
    <KeyboardAvoidingContent>
      <PageRoot edges={edges}>
        <PageContent style={style}>{children}</PageContent>
      </PageRoot>
    </KeyboardAvoidingContent>
  );
};

const PageRoot = styled(SafeAreaView)`
  ${({ theme }) => ss.PageRoot(theme)};
`;

const PageContent = styled.View`
  ${({ theme }) => ss.PageContainer(theme)};
`;
