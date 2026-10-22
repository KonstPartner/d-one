import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

import { normalizeAppLanguage } from '@shared/i18n';

import { formatReleaseDate } from '../lib/formatReleaseDate';
import { getAppReleaseKind, getReleaseTranslationPrefix } from '../lib/version';
import type { AppRelease, AppReleaseChangeIcon } from '../model/types';
import * as s from '../styles/VersionHistory';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const CHANGE_ICON: Record<AppReleaseChangeIcon, IoniconName> = {
  ai: 'sparkles-outline',
  backup: 'archive-outline',
  diary: 'book-outline',
  errors: 'alert-circle-outline',
  input: 'create-outline',
  photo: 'image-outline',
  subscriptions: 'people-outline',
  sync: 'cloud-done-outline',
  timer: 'timer-outline',
};

type VersionDetailsProps = {
  release: AppRelease;
  current: boolean;
};

export const VersionDetails = ({ release, current }: VersionDetailsProps) => {
  const theme = useTheme();

  const { t, i18n } = useTranslation();

  const language = normalizeAppLanguage(i18n.resolvedLanguage);

  const kind = getAppReleaseKind(release.version);

  const translationPrefix = getReleaseTranslationPrefix(release.version);

  return (
    <s.DetailsRoot>
      <s.ReleaseHero>
        <s.ReleaseBadge style={s.getReleaseBadgeStyle(theme, kind)}>
          <s.ReleaseBadgeText style={s.getReleaseBadgeTextStyle(theme, kind)}>
            {release.version}
          </s.ReleaseBadgeText>
        </s.ReleaseBadge>

        <s.ReleaseHeroCopy>
          <s.ReleaseTitleRow>
            <s.ReleaseTitle>{release.version}</s.ReleaseTitle>

            {current && (
              <s.CurrentBadge>
                <s.CurrentBadgeText>
                  {t('versionHistory.current')}
                </s.CurrentBadgeText>
              </s.CurrentBadge>
            )}
          </s.ReleaseTitleRow>

          <s.ReleaseDateLabel>
            {t('versionHistory.releaseDate')}
          </s.ReleaseDateLabel>

          <s.ReleaseDate>
            {formatReleaseDate(release.releasedAt, language, 'long')}
          </s.ReleaseDate>

          <s.ReleaseSummary>
            {t(`${translationPrefix}.summary`)}
          </s.ReleaseSummary>
        </s.ReleaseHeroCopy>
      </s.ReleaseHero>

      <s.ChangesTitle>{t('versionHistory.changes')}</s.ChangesTitle>

      <s.ChangeList>
        {release.changes.map((change) => (
          <s.ChangeCard key={change.key}>
            <s.ChangeIcon>
              <Ionicons
                name={CHANGE_ICON[change.icon]}
                size={20}
                color={theme.colors.shades.primary.text}
              />
            </s.ChangeIcon>

            <s.ChangeCopy>
              <s.ChangeTitle>
                {t(`${translationPrefix}.changes.${change.key}.title`)}
              </s.ChangeTitle>

              <s.ChangeDescription>
                {t(`${translationPrefix}.changes.${change.key}.description`)}
              </s.ChangeDescription>
            </s.ChangeCopy>
          </s.ChangeCard>
        ))}
      </s.ChangeList>
    </s.DetailsRoot>
  );
};
