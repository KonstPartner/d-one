import { Pressable, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';

import { PlatformOS } from '@features/shared/model';
import * as globalStyles from '@features/shared/styles/global';

const WebRefresh = ({ onRefresh }: { onRefresh: () => void }) => {
  const theme = useTheme();

  if (!PlatformOS.WEB) {
    return null;
  }

  return (
    <View style={globalStyles.ContainerFlex('row', 'center')}>
      <Pressable onPress={onRefresh}>
        <Ionicons color={theme.colors.text} name="refresh-circle" size={32} />
      </Pressable>
    </View>
  );
};

export default WebRefresh;
