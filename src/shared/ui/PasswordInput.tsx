import { useState } from 'react';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Input, type InputProps } from './Input';
import * as s from './styles/PasswordInput';

export const PasswordInput = ({
  withLabel,
  labelPlaceholder,
  placeholder = '',
  style,
  ...inputProps
}: InputProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const [hidePassword, setHidePassword] = useState(true);

  return (
    <>
      {withLabel && <s.Label>{labelPlaceholder || placeholder}</s.Label>}

      <s.Container>
        <Input
          {...inputProps}
          placeholder={placeholder}
          style={[style, s.getFieldStyle(theme)]}
          secureTextEntry={hidePassword}
          withLabel={false}
        />

        <s.Toggle
          accessibilityRole="button"
          accessibilityLabel={
            hidePassword
              ? t('common.accessibility.showPassword')
              : t('common.accessibility.hidePassword')
          }
          onPress={() => {
            setHidePassword((current) => !current);
          }}
        >
          <Ionicons
            name={hidePassword ? 'eye-outline' : 'eye-off-outline'}
            size={25}
            color={theme.colors.muted}
          />
        </s.Toggle>
      </s.Container>
    </>
  );
};
