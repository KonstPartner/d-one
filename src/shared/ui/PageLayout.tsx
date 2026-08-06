import {
  KeyboardAvoidingView,
  Platform,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import styled from '@emotion/native';
import type { PropsWithChildren } from 'react';
import { type Edges, SafeAreaView } from 'react-native-safe-area-context';

type PageLayoutProps = PropsWithChildren<{
  edges?: Edges;
  style?: StyleProp<ViewStyle>;
}>;

export const PageLayout = ({
  children,
  edges = ['right', 'left'],
  style,
}: PageLayoutProps) => {
  const page = (
    <PageRoot edges={edges}>
      <PageContent style={style}>{children}</PageContent>
    </PageRoot>
  );

  if (Platform.OS === 'web') {
    return page;
  }

  return (
    <KeyboardContainer
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {page}
    </KeyboardContainer>
  );
};

const KeyboardContainer = styled(KeyboardAvoidingView)`
  flex: 1;
`;

const PageRoot = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.bg};
`;

const PageContent = styled.View`
  flex: 1;
  padding-left: ${({ theme }) => theme.spacing.md}px;
  padding-right: ${({ theme }) => theme.spacing.md}px;
`;
