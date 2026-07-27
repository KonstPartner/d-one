import { ReactNode } from 'react';
import { View } from 'react-native';

import * as styles from '@entities/shared/styles/LoadingView';
import Spinner from '@entities/shared/ui/Spinner';

const LoadingView = ({
  loading = true,
  children = null,
  className,
}: {
  loading?: boolean;
  children?: ReactNode;
  className?: string;
}) => {
  if (loading) {
    return (
      <View style={styles.ViewStyle} className={className}>
        <Spinner size={32} />
      </View>
    );
  }
  if (children === null) {
    return null;
  }

  return <>{children}</>;
};

export default LoadingView;
