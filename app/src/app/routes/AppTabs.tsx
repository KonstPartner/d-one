import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import styled from '@emotion/native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useIsMutating, useQuery } from '@tanstack/react-query';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { HeaderMenu } from '@widgets/header-menu';
import { useDiaryTransferState } from '@entities/diary';
import { sessionMutationKeys, useSession } from '@entities/session';
import { userProfileQueryOptions, UserRole } from '@entities/user';
import { useNetwork } from '@shared/lib/network';
import { PlatformOS } from '@shared/lib/platform';
import { Row } from '@shared/styles';

import { DiaryRuntimeBoundary } from '../providers/DiaryRuntimeBoundary';

import { createTabScreenOptions } from './screen-options/tabScreenOptions';

const isDiaryTransferRuntimeLocked = (
  phase: ReturnType<typeof useDiaryTransferState>['phase']
): boolean =>
  phase === 'waitingForSync' ||
  phase === 'validating' ||
  phase === 'resolvingConflicts' ||
  phase === 'processing';

export const AppTabs = () => {
  const theme = useTheme();

  const { t } = useTranslation();

  const { sessionUser, isSessionReady } = useSession();

  const transfer = useDiaryTransferState();

  const transferLocked = isDiaryTransferRuntimeLocked(transfer.phase);

  const activeSessionMutations = useIsMutating({
    mutationKey: sessionMutationKeys.root,
  });

  const isSessionMutating = activeSessionMutations > 0;

  const userId = sessionUser?.uid ?? null;

  const { data: profile } = useQuery({
    ...userProfileQueryOptions(userId),

    enabled: isSessionReady && userId !== null && !isSessionMutating,
  });

  const { status: networkStatus } = useNetwork();

  const role = profile?.role ?? null;

  const isPending = role === null;

  const isUser = role === UserRole.User;

  const isFollower = role === UserRole.Follower;

  const ownerRuntimeUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (transferLocked || !isUser || userId === null) {
      return;
    }

    ownerRuntimeUserIdRef.current = userId;
  }, [isUser, transferLocked, userId]);

  const diaryRuntimeUserId = transferLocked
    ? (ownerRuntimeUserIdRef.current ?? (isUser ? userId : null))
    : userId;

  const diaryRuntimeEnabled = transferLocked
    ? diaryRuntimeUserId !== null
    : isUser;

  const supportsOwnerCloud = !PlatformOS.WEB;

  const networkIconName: keyof typeof Ionicons.glyphMap =
    networkStatus === 'online'
      ? 'wifi'
      : networkStatus === 'offline'
        ? 'cloud-offline-outline'
        : 'help-circle-outline';

  const renderDiaryIcon = ({
    color,
    size,
    focused,
  }: {
    color: string;
    size: number;
    focused: boolean;
  }) => (
    <Ionicons
      name={focused ? 'book' : 'book-outline'}
      size={size}
      color={color}
    />
  );

  return (
    <Root>
      <DiaryRuntimeBoundary
        enabled={diaryRuntimeEnabled}
        userId={diaryRuntimeUserId}
      >
        <Tabs
          screenOptions={createTabScreenOptions({
            theme,

            headerRight: () => (
              <View style={Row(theme, 'center', 'center', 'sm')}>
                <Ionicons
                  name={networkIconName}
                  size={20}
                  color={theme.colors.text}
                />

                <HeaderMenu />
              </View>
            ),
          })}
        >
          <Tabs.Screen
            name="diary"
            options={{
              title: t('layout.tabs.diary'),

              href: isUser ? undefined : null,

              tabBarIcon: renderDiaryIcon,
            }}
          />

          <Tabs.Screen
            name="follower-diary"
            options={{
              title: t('layout.tabs.diary'),

              href: isFollower ? undefined : null,

              tabBarIcon: renderDiaryIcon,
            }}
          />

          <Tabs.Screen
            name="cloud"
            options={{
              title: t('layout.tabs.cloud'),

              href: isUser && supportsOwnerCloud ? undefined : null,

              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons
                  name={focused ? 'cloud' : 'cloud-outline'}
                  size={size}
                  color={color}
                />
              ),
            }}
          />

          <Tabs.Screen
            name="pending"
            options={{
              title: t('layout.tabs.pending'),

              href: isPending ? undefined : null,

              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons
                  name={focused ? 'time' : 'time-outline'}
                  size={size}
                  color={color}
                />
              ),
            }}
          />

          <Tabs.Screen
            name="profile"
            options={{
              title: t('layout.tabs.profile'),

              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons
                  name={focused ? 'person' : 'person-outline'}
                  size={size}
                  color={color}
                />
              ),
            }}
          />
        </Tabs>
      </DiaryRuntimeBoundary>
    </Root>
  );
};

const Root = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.bg};
`;
