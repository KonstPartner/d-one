import { type ReactNode, Suspense } from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';

import { errorMapper, type ErrorType } from '@shared/lib/errors';

import { Spinner } from './Spinner';
import * as s from './styles/AsyncState';

type LoaderProps = {
  children: ReactNode;
  errorType?: ErrorType;
};

type ErrorFallbackProps = {
  error: unknown;
  onRetry: () => void;
  errorType: ErrorType;
};

const ErrorFallback = ({ error, onRetry, errorType }: ErrorFallbackProps) => {
  const { t } = useTranslation();

  const errorMessage = errorMapper(error, errorType);

  return (
    <s.ErrorContent>
      <s.ErrorText>{errorMessage}</s.ErrorText>

      <s.RetryButton onPress={onRetry}>
        <s.RetryButtonText>{t('common.actions.tryAgain')}</s.RetryButtonText>
      </s.RetryButton>
    </s.ErrorContent>
  );
};

export const Loader = ({ children, errorType = 'firebase' }: LoaderProps) => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <ErrorFallback
              error={error}
              errorType={errorType}
              onRetry={resetErrorBoundary}
            />
          )}
        >
          <Suspense
            fallback={
              <s.Center>
                <Spinner size={32} />
              </s.Center>
            }
          >
            {children}
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};
