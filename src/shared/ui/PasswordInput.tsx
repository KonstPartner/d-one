import { useState } from 'react';
import { StyleSheet } from 'react-native';
import styled from '@emotion/native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Input, InputLabel, type InputProps } from './Input';

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
      {withLabel && <InputLabel>{labelPlaceholder || placeholder}</InputLabel>}

      <PasswordContainer>
        <Input
          {...inputProps}
          placeholder={placeholder}
          style={[style, styles.passwordInput]}
          secureTextEntry={hidePassword}
          withLabel={false}
        />

        <PasswordToggle
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
        </PasswordToggle>
      </PasswordContainer>
    </>
  );
};

const PasswordContainer = styled.View`
  position: relative;
  width: 100%;
`;

const PasswordToggle = styled.Pressable`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 52px;
  align-items: center;
  justify-content: center;
`;

const styles = StyleSheet.create({
  passwordInput: {
    paddingRight: 52,
  },
});
