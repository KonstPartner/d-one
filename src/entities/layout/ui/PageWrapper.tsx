import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@emotion/react';
import { Edges, SafeAreaView } from 'react-native-safe-area-context';

import { AvoidKeyboardView } from '@entities/shared/ui';
import * as globalStyles from '@features/shared/styles/global';

const PageWrapper = ({
  children,
  edges = ['right', 'left'],
  style = {},
}: {
  children: ReactNode;
  edges?: Edges;
  style?: StyleProp<ViewStyle>;
}) => {
  const theme = useTheme();
  const PageStylesFlatten = StyleSheet.flatten([
    globalStyles.PageContainer(theme),
    style,
  ]);

  return (
    <AvoidKeyboardView>
      <SafeAreaView style={globalStyles.PageRoot(theme)} edges={edges}>
        <View style={PageStylesFlatten}>{children}</View>
      </SafeAreaView>
    </AvoidKeyboardView>
  );
};

export default PageWrapper;
