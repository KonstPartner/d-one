import styled from '@emotion/native';
import { useTranslation } from 'react-i18next';

import { Button } from './Button';

type ErrorSectionProps = {
  message: string;
  onRetry: () => void;
};

export const ErrorSection = ({ message, onRetry }: ErrorSectionProps) => {
  const { t } = useTranslation();

  return (
    <Root>
      <Message>{message}</Message>

      <Button tone="primary" onPress={onRetry}>
        <RetryText>{t('common.actions.tryAgain')}</RetryText>
      </Button>
    </Root>
  );
};

const Root = styled.View`
  align-items: center;
  justify-content: center;

  gap: 10px;
`;

const Message = styled.Text`
  color: ${({ theme }) => theme.colors.text};

  font-size: ${({ theme }) => theme.size.base}px;
  font-weight: ${({ theme }) => theme.weight.regular};
  line-height: ${({ theme }) => theme.lineHeight.md}px;

  text-align: center;
`;

const RetryText = styled.Text`
  color: ${({ theme }) => theme.colors.white};

  font-size: ${({ theme }) => theme.size.md}px;
  font-weight: ${({ theme }) => theme.weight.bold};
`;
