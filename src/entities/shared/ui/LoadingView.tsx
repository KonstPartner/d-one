import { ReactNode } from 'react';
import { View } from 'react-native';

import * as styles from '../styles/LoadingView';

import Spinner from './Spinner';

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
