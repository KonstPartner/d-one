import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useQueries } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { NativeSyntheticEvent, TextLayoutEventData } from 'react-native';

import {
  relatedUserProfileQueryOptions,
  type UserProfile,
  UserRole,
} from '@entities/user';

import * as s from '../styles/ProfilePage';

type ProfileRelationsRowProps = {
  profile: UserProfile;
};

export const ProfileRelationsRow = ({ profile }: ProfileRelationsRowProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);

  const relationIds = useMemo(() => {
    if (profile.role === UserRole.User) {
      return Array.from(new Set(profile.followerUserIds));
    }

    if (profile.role === UserRole.Follower) {
      return Array.from(new Set(profile.followedUserIds ?? []));
    }

    return [];
  }, [profile.followedUserIds, profile.followerUserIds, profile.role]);

  const profileQueries = useQueries({
    queries: relationIds.map((uid) => relatedUserProfileQueryOptions(uid)),
  });

  const loading = profileQueries.some((query) => query.isPending);
  const failed = profileQueries.some((query) => query.isError);

  const relatedUsers = profileQueries.flatMap((query) =>
    query.data === undefined
      ? []
      : [
          {
            uid: query.data.uid,
            nickname: query.data.nickname,
          },
        ]
  );

  const label =
    profile.role === UserRole.User
      ? t('auth.profile.relations.followers')
      : t('auth.profile.relations.following');

  const emptyValue =
    profile.role === UserRole.User
      ? t('auth.profile.relations.noFollowers')
      : t('auth.profile.relations.notAssigned');

  const value = loading
    ? t('auth.profile.relations.loading')
    : failed
      ? t('auth.profile.relations.loadFailed')
      : relatedUsers.length > 0
        ? relatedUsers.map((user) => user.nickname).join(', ')
        : emptyValue;

  const expandable = !loading && !failed && relatedUsers.length > 0;

  useEffect(() => {
    setExpanded(false);
    setCanExpand(false);
  }, [value]);

  const handleTextLayout = useCallback(
    (event: NativeSyntheticEvent<TextLayoutEventData>) => {
      if (!expandable) {
        setCanExpand(false);

        return;
      }

      setCanExpand(event.nativeEvent.lines.length > 1);
    },
    [expandable]
  );

  if (profile.role !== UserRole.User && profile.role !== UserRole.Follower) {
    return null;
  }

  return (
    <s.ProfileRow>
      <s.ProfileLabel>{label}</s.ProfileLabel>

      <s.RelationValue>
        {expandable && (
          <s.RelationMeasureText
            onTextLayout={handleTextLayout}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            pointerEvents="none"
          >
            {value}
          </s.RelationMeasureText>
        )}

        {relatedUsers.length > 0 && !loading && !failed ? (
          <s.RelationVisibleRow>
            <s.RelationBadgesViewport
              style={
                canExpand && !expanded
                  ? s.getRelationBadgesCollapsedStyle(theme)
                  : undefined
              }
            >
              <s.RelationBadges>
                {relatedUsers.map((user) => (
                  <s.ProfileBadge
                    key={user.uid}
                    style={s.getProfileBadgeStyle(theme, 'primary')}
                  >
                    <s.ProfileBadgeText
                      style={s.getProfileBadgeTextStyle(theme, 'primary')}
                    >
                      {user.nickname}
                    </s.ProfileBadgeText>
                  </s.ProfileBadge>
                ))}
              </s.RelationBadges>
            </s.RelationBadgesViewport>

            {canExpand && (
              <s.RelationToggle
                accessibilityRole="button"
                accessibilityLabel={t(
                  expanded
                    ? 'auth.profile.relations.collapse'
                    : 'auth.profile.relations.expand'
                )}
                onPress={() => {
                  setExpanded((current) => !current);
                }}
              >
                <Ionicons
                  name={expanded ? 'chevron-up' : 'chevron-down'}
                  size={theme.size.lg}
                  color={theme.colors.muted}
                />
              </s.RelationToggle>
            )}
          </s.RelationVisibleRow>
        ) : (
          <s.RelationText>{value}</s.RelationText>
        )}
      </s.RelationValue>
    </s.ProfileRow>
  );
};
