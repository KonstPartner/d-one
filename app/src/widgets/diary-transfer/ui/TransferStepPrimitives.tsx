import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

import * as ss from '@shared/styles';
import { IconButton } from '@shared/ui';

import * as s from '../styles/DiaryTransferModal';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type TransferStepHeaderProps = {
  title: string;

  disabled: boolean;

  onBack?: () => void;
  onClose?: () => void;
};

export const TransferStepHeader = ({
  title,

  disabled,

  onBack,
  onClose,
}: TransferStepHeaderProps) => {
  const theme = useTheme();

  const { t } = useTranslation();

  return (
    <s.Header>
      <s.HeaderSide>
        {onBack !== undefined && (
          <IconButton
            icon="arrow-back"
            accessibilityLabel={t('transfer.actions.back')}
            disabled={disabled}
            tone="muted"
            variant="solid"
            onPress={onBack}
          />
        )}
      </s.HeaderSide>

      <s.Title style={ss.Heading(theme)}>{title}</s.Title>

      <s.HeaderSide $align="end">
        {onClose !== undefined && (
          <IconButton
            icon="close"
            accessibilityLabel={t('common.close')}
            disabled={disabled}
            tone="muted"
            variant="solid"
            onPress={onClose}
          />
        )}
      </s.HeaderSide>
    </s.Header>
  );
};

type TransferStepOptionProps = {
  icon: IoniconName;

  title: string;
  description?: string;

  disabled: boolean;

  showChevron?: boolean;

  onPress: () => void;
};

export const TransferStepOption = ({
  icon,

  title,
  description,

  disabled,

  showChevron = true,

  onPress,
}: TransferStepOptionProps) => {
  const theme = useTheme();

  return (
    <s.OptionButton
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{
        disabled,
      }}
      disabled={disabled}
      $disabled={disabled}
      onPress={onPress}
      style={disabled ? undefined : s.getOptionButtonStyle}
    >
      <s.OptionIcon style={ss.CenterContent}>
        <Ionicons name={icon} size={22} color={theme.colors.text} />
      </s.OptionIcon>

      <s.OptionContent>
        <s.OptionTitle>{title}</s.OptionTitle>

        {description !== undefined && (
          <s.OptionDescription>{description}</s.OptionDescription>
        )}
      </s.OptionContent>

      {showChevron && !disabled && (
        <Ionicons name="chevron-forward" size={20} color={theme.colors.muted} />
      )}
    </s.OptionButton>
  );
};
