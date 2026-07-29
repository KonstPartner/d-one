import { ScrollView, Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import * as styles from '@features/header/styles/Settings';
import { LanguageSelect } from '@features/i18n/ui';
import * as globalStyles from '@features/shared/styles/global';
import { PortalModal } from '@features/shared/ui';
import { ThemeSwitcher } from '@features/theme/ui';

const HeaderMenuSettings = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <PortalModal visible={visible} onClose={onClose} withoutScroll>
      <ScrollView>
        <View style={styles.SettingsContent}>
          <Text style={globalStyles.Title(theme)}>
            {t('header.settings.title')}
          </Text>

          <Text style={globalStyles.MediumTitle(theme)}>
            {t('header.settings.themeTitle')}
          </Text>

          <Text style={styles.SettingsSubtitle(theme)}>
            {t('header.settings.themeSubtitle')}
          </Text>

          <ThemeSwitcher />

          <Text style={globalStyles.MediumTitle(theme)}>
            {t('header.settings.languageTitle')}
          </Text>

          <Text style={styles.SettingsSubtitle(theme)}>
            {t('header.settings.languageSubtitle')}
          </Text>

          <LanguageSelect />
        </View>
      </ScrollView>
    </PortalModal>
  );
};

export default HeaderMenuSettings;
