import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import * as ss from '@shared/styles';

import { Button } from './Button';
import * as s from './styles/ErrorSection';

type ErrorSectionProps = {
  message: string;
  onRetry: () => void;
};

export const ErrorSection = ({ message, onRetry }: ErrorSectionProps) => {
  const { t } = useTranslation();

  return (
    <SafeAreaView>
      <s.Root style={ss.CenterContent}>
        <s.Message>{message}</s.Message>

        <Button tone="primary" onPress={onRetry}>
          <s.RetryText>{t('common.actions.tryAgain')}</s.RetryText>
        </Button>
      </s.Root>
    </SafeAreaView>
  );
};
