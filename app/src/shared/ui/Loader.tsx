import { type ReactNode, Suspense } from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';

import { errorMapper, type ErrorType } from '@shared/lib/errors';

import { ErrorSection } from './ErrorSection';
import { Spinner } from './Spinner';
import * as s from './styles/AsyncState';

type LoaderProps = {
  children: ReactNode;
  errorType?: ErrorType;
};

export const Loader = ({ children, errorType = 'firebase' }: LoaderProps) => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <ErrorSection
              message={errorMapper(error, errorType)}
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
