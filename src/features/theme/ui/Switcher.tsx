import { Pressable, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';

import * as globalStyles from '@features/shared/styles/global';
import { useThemeMode } from '@features/theme/model';
import * as styles from '@features/theme/styles/Switcher';

const ThemeSwitcher = () => {
  const { mode, setMode } = useThemeMode();
  const themeObj = useTheme();

  const isLight = mode === 'light';
  const isDark = mode === 'dark';
  const isSystem = mode === 'system';

  return (
    <View
      style={[
        globalStyles.ContainerFlex('row', 'space-between', 'center'),
        styles.Container(themeObj),
      ]}
      accessibilityRole="radiogroup"
      accessibilityLabel="Color theme"
    >
      <Pressable
        onPress={() => setMode('light')}
        accessibilityRole="radio"
        accessibilityState={{ selected: isLight }}
        style={[
          styles.ButtonBase,
          isLight ? styles.ButtonActive(themeObj) : styles.ButtonInactive,
        ]}
      >
        <Ionicons
          name="sunny-outline"
          size={18}
          color={isLight ? themeObj.colors.bg : themeObj.colors.muted}
        />
      </Pressable>

      <Pressable
        onPress={() => setMode('dark')}
        accessibilityRole="radio"
        accessibilityState={{ selected: isDark }}
        style={[
          styles.ButtonBase,
          isDark ? styles.ButtonActive(themeObj) : styles.ButtonInactive,
        ]}
      >
        <Ionicons
          name="moon-outline"
          size={18}
          color={isDark ? themeObj.colors.bg : themeObj.colors.muted}
        />
      </Pressable>

      <Pressable
        onPress={() => setMode('system')}
        accessibilityRole="radio"
        accessibilityState={{ selected: isSystem }}
        style={[
          styles.ButtonBase,
          isSystem ? styles.ButtonActive(themeObj) : styles.ButtonInactive,
        ]}
      >
        <Ionicons
          name="desktop-outline"
          size={18}
          color={isSystem ? themeObj.colors.bg : themeObj.colors.muted}
        />
      </Pressable>
    </View>
  );
};

export default ThemeSwitcher;
