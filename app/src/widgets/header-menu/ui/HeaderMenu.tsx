import { useMemo, useState } from 'react';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { usePathname } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Popover from 'react-native-popover-view';

import {
  type HeaderMenuItem,
  useHeaderMenuContext,
} from '../model/HeaderMenuProvider';
import * as s from '../styles/HeaderMenu';

import { HeaderMenuSettings } from './HeaderMenuSettings';

type HeaderMenuProps = {
  color?: string;
};

export const HeaderMenu = ({ color }: HeaderMenuProps) => {
  const theme = useTheme();
  const pathname = usePathname();
  const { t } = useTranslation();

  const { getItems } = useHeaderMenuContext();

  const [menuVisible, setMenuVisible] = useState(false);

  const [settingsVisible, setSettingsVisible] = useState(false);

  const extraItems = getItems(pathname);

  const items = useMemo<HeaderMenuItem[]>(
    () => [
      ...extraItems,

      {
        key: 'settings',
        labelKey: 'header.menu.settings',
        icon: 'settings-outline',
        onPress: () => {
          setSettingsVisible(true);
        },
      },
    ],
    [extraItems]
  );

  const handleItemPress = (item: HeaderMenuItem): void => {
    setMenuVisible(false);

    item.onPress();
  };

  return (
    <>
      <Popover
        isVisible={menuVisible}
        onRequestClose={() => {
          setMenuVisible(false);
        }}
        popoverStyle={{
          backgroundColor: 'transparent',

          borderRadius: theme.radius.md,
        }}
        from={
          <s.Trigger
            onPress={() => {
              setMenuVisible(true);
            }}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={t('header.open')}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={20}
              color={color ?? theme.colors.text}
            />
          </s.Trigger>
        }
      >
        <s.MenuContainer>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            const destructive = item.destructive === true;

            const disabled = item.disabled === true;

            const itemColor = destructive
              ? theme.colors.danger
              : disabled
                ? theme.colors.muted
                : theme.colors.text;

            return (
              <s.MenuRow
                key={item.key}
                disabled={disabled}
                onPress={() => {
                  handleItemPress(item);
                }}
                style={({ pressed }) =>
                  s.getMenuRowStyle(theme, {
                    pressed,
                    isLast,
                    disabled,
                  })
                }
              >
                <s.MenuItemContent>
                  {item.icon && (
                    <Ionicons name={item.icon} size={18} color={itemColor} />
                  )}

                  <s.MenuText
                    style={s.getMenuTextStyle(theme, {
                      destructive,
                      disabled,
                    })}
                  >
                    {t(item.labelKey)}
                  </s.MenuText>
                </s.MenuItemContent>

                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.colors.muted}
                />
              </s.MenuRow>
            );
          })}
        </s.MenuContainer>
      </Popover>

      <HeaderMenuSettings
        visible={settingsVisible}
        onClose={() => {
          setSettingsVisible(false);
        }}
      />
    </>
  );
};
