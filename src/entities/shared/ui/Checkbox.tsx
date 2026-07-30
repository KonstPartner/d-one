import { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';

import * as globalStyles from '@features/shared/styles/global';

import * as styles from '../styles/Checkbox';

const Checkbox = ({
  onPress,
  label = '',
  checked,
  children,
}: {
  onPress: () => void;
  label?: string;
  checked: boolean;
  children?: ReactNode;
}) => {
  const theme = useTheme();

  return (
    <Pressable
      style={[
        globalStyles.ContainerFlex('row', '', 'center', 10),
        styles.ItemButton,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.Checkbox(theme),
          checked ? styles.Checked(theme) : styles.Unchecked(theme),
        ]}
      >
        {checked && <Ionicons name="checkmark" size={24} color="white" />}
      </View>
      {children ?? <Text style={globalStyles.TextStyle(theme)}>{label}</Text>}
    </Pressable>
  );
};

export default Checkbox;
