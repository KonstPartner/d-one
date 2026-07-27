import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { HeaderMenu } from '@features/header/ui';
import { headerTabs } from '@features/layout/model';

const TabsRoot = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={headerTabs({ theme, headerRight: () => <HeaderMenu /> })}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('layout.tabs.home'),
          tabBarLabel: t('layout.tabs.home'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: t('layout.tabs.profile'),
          tabBarLabel: t('layout.tabs.profile'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsRoot;
