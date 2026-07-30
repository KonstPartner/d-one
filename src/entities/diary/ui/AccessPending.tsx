import { Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import * as globalStyles from '@features/shared/styles/global';

import * as styles from '../styles/AccessPending';

const AccessPending = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.Root}>
      <View style={styles.Card(theme)}>
        <View style={styles.IconContainer(theme)}>
          <Ionicons
            name="time-outline"
            size={32}
            color={theme.colors.primary}
          />
        </View>

        <View style={styles.Content(theme)}>
          <Text style={[globalStyles.Title(theme), styles.CenteredText]}>
            {t('diary.pending.title')}
          </Text>

          <Text style={[globalStyles.MutedText(theme), styles.CenteredText]}>
            {t('diary.pending.description')}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default AccessPending;
