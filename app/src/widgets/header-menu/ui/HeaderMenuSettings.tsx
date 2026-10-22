import { useTranslation } from 'react-i18next';

import { LanguageSelect } from '@features/change-language';
import { ThemeSwitcher } from '@features/theme-switcher';
import { AppVersionHistory } from '@features/view-app-version-history';
import { PortalModal } from '@shared/ui';

import * as s from '../styles/HeaderMenuSettings';

type HeaderMenuSettingsProps = {
  visible: boolean;
  onClose: () => void;
};

export const HeaderMenuSettings = ({
  visible,
  onClose,
}: HeaderMenuSettingsProps) => {
  const { t } = useTranslation();

  return (
    <PortalModal visible={visible} onClose={onClose} withoutScroll>
      <s.Scroll>
        <s.Content>
          <s.Title>{t('header.settings.title')}</s.Title>

          <s.Block>
            <s.SectionTitle>{t('header.settings.themeTitle')}</s.SectionTitle>

            <s.Subtitle>{t('header.settings.themeSubtitle')}</s.Subtitle>

            <ThemeSwitcher />
          </s.Block>

          <s.Block>
            <s.SectionTitle>
              {t('header.settings.languageTitle')}
            </s.SectionTitle>

            <s.Subtitle>{t('header.settings.languageSubtitle')}</s.Subtitle>

            <LanguageSelect />
          </s.Block>

          <s.Block>
            <s.SectionTitle>{t('header.settings.versionTitle')}</s.SectionTitle>

            <s.Subtitle>{t('header.settings.versionSubtitle')}</s.Subtitle>

            <AppVersionHistory />
          </s.Block>
        </s.Content>
      </s.Scroll>
    </PortalModal>
  );
};
