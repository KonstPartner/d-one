import type { ReactNode } from 'react';

import { Spinner } from './Spinner';
import * as s from './styles/AsyncState';

type LoadingViewProps = {
  loading?: boolean;
  children?: ReactNode;
};

export const LoadingView = ({
  loading = true,
  children = null,
}: LoadingViewProps) => {
  if (loading) {
    return (
      <s.Center>
        <Spinner type="Image" size={132} />
      </s.Center>
    );
  }

  if (children === null) {
    return null;
  }

  return <>{children}</>;
};
