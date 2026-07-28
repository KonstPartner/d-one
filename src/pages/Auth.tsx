import { Text, View } from 'react-native';

import { PageWrapper } from '@entities/layout/ui';
import { Loader, LoadingView } from '@entities/shared/ui';
import { useAuthData } from '@features/auth/api';

const Auth = () => {
  const { isAuthLoading } = useAuthData();

  return (
    <PageWrapper edges={['bottom', 'right', 'left']}>
      <LoadingView loading={isAuthLoading}>
        <Loader errorType="api">
          <View>
            <Text>Auth</Text>
          </View>
        </Loader>
      </LoadingView>
    </PageWrapper>
  );
};

export default Auth;
