import type { ReactNode } from 'react';

import { Spinner } from './Spinner';
import * as s from './styles/AsyncState';

type LoadingViewProps = {
  loading?: boolean;
  children?: ReactNode;
  className?: string;
};

export const LoadingView = ({
  loading = true,
  children = null,
  className,
}: LoadingViewProps) => {
  if (loading) {
    return (
      <s.Center className={className}>
        <Spinner size={32} />
      </s.Center>
    );
  }

  if (children === null) {
    return null;
  }

  return <>{children}</>;
};
