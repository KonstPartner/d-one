import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import * as styles from '@entities/shared/styles/Input';
import Input, { InputProps } from '@entities/shared/ui/Input';
import * as globalStyles from '@features/shared/styles/global';

const PasswordInput = (props: InputProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [hidePassword, setHidePassword] = useState(true);

  const {
    withLabel,
    labelPlaceholder,
    placeholder = '',
    style,
    ...inputProps
  } = props;

  return (
    <>
      {withLabel && (
        <Text style={globalStyles.Label(theme)}>
          {labelPlaceholder || placeholder}
        </Text>
      )}

      <View style={styles.PasswordContainer}>
        <Input
          {...inputProps}
          placeholder={placeholder}
          style={[style, styles.PasswordInputPadding]}
          secureTextEntry={hidePassword}
          withLabel={false}
        />

        <Pressable
          style={styles.PasswordIconButton}
          accessibilityLabel={
            hidePassword
              ? t('common.accessibility.showPassword')
              : t('common.accessibility.hidePassword')
          }
          onPress={() => setHidePassword(!hidePassword)}
        >
          <Ionicons
            name={hidePassword ? 'eye-outline' : 'eye-off-outline'}
            size={25}
            color={theme.colors.muted}
          />
        </Pressable>
      </View>
    </>
  );
};

export default PasswordInput;
