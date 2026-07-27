import { Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import * as styles from '@entities/shared/styles/Error';
import Button from '@entities/shared/ui/Button';
import * as globalStyles from '@features/shared/styles/global';

const ErrorSection = ({
  callback,
  error,
}: {
  callback: () => void;
  error: string;
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <View style={styles.ViewStyle}>
      <Text style={globalStyles.TextStyle(theme)}>{error}</Text>
      <Button style={globalStyles.ButtonStyles(theme)} onPress={callback}>
        <Text style={globalStyles.TextWhite}>
          {t('common.actions.tryAgain')}
        </Text>
      </Button>
    </View>
  );
};

export default ErrorSection;
