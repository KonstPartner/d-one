import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { usePathname } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Popover from 'react-native-popover-view';

import * as globalStyles from '@features/shared/styles/global';

import {
  HeaderMenuItem,
  useHeaderBaseMenu,
  useHeaderMenuContext,
} from '../model';
import * as styles from '../styles/Menu';

const HeaderMenu = ({ color }: { color?: string }) => {
  const theme = useTheme();
  const pathname = usePathname();
  const { t } = useTranslation();

  const { getItems } = useHeaderMenuContext();

  const [menuVisible, setMenuVisible] = useState(false);

  const extraItems = getItems(pathname);
  const { baseItems, baseOverlays } = useHeaderBaseMenu();

  const items = useMemo(
    () => [...extraItems, ...baseItems],
    [extraItems, baseItems]
  );

  const handleItemPress = (item: HeaderMenuItem) => {
    setMenuVisible(false);
    item.onPress();
  };

  return (
    <>
      <Popover
        isVisible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
        popoverStyle={styles.Popover(theme)}
        from={
          <Pressable
            onPress={() => setMenuVisible(true)}
            hitSlop={10}
            style={styles.Trigger}
            accessibilityRole="button"
            accessibilityLabel={t('header.open')}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={20}
              color={color ?? theme.colors.text}
            />
          </Pressable>
        }
      >
        <View style={styles.MenuContainer}>
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;

            return (
              <Pressable
                key={item.key}
                disabled={item.disabled}
                onPress={() => handleItemPress(item)}
                style={({ pressed }) => [
                  globalStyles.ContainerFlex('row', 'space-between', 'center'),
                  styles.MenuRow,
                  styles.MenuRowDynamic(theme, {
                    pressed,
                    isLast,
                    disabled: item.disabled,
                  }),
                ]}
              >
                <Text style={styles.MenuText(theme, item.destructive)}>
                  {t(item.labelKey)}
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.colors.muted}
                />
              </Pressable>
            );
          })}
        </View>
      </Popover>

      {baseOverlays}
    </>
  );
};

export default HeaderMenu;
