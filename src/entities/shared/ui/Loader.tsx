import { Suspense } from 'react';
import { View } from 'react-native';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import * as styles from '@entities/shared/styles/Loader';
import ErrorSection from '@entities/shared/ui/Error';
import Spinner from '@entities/shared/ui/Spinner';
import { errorMapper, ErrorType } from '@features/shared/model';

type LoaderProps = {
  children: ReactNode;
  errorType?: ErrorType;
};

const Loader = ({ children, errorType = 'api' }: LoaderProps) => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ resetErrorBoundary, error }) => {
            const errorMessage = errorMapper(error, errorType);

            return (
              <ErrorSection
                callback={resetErrorBoundary}
                error={errorMessage}
              />
            );
          }}
        >
          <Suspense
            fallback={
              <View style={styles.ViewStyle}>
                <Spinner size={32} />
              </View>
            }
          >
            {children}
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};

export default Loader;
