import { Suspense } from 'react';
import { View } from 'react-native';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { errorMapper, ErrorType } from '@features/shared/model';

import * as styles from '../styles/Loader';

import ErrorSection from './Error';
import Spinner from './Spinner';

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
