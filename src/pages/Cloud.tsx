import { Text, View } from 'react-native';

import { useAuthData } from '@features/auth/api';
import { PageWrapper } from '@entities/layout/ui';
import { Loader, LoadingView } from '@entities/shared/ui';

const Cloud = () => {
  const { isAuthLoading } = useAuthData();

  return (
    <PageWrapper>
      <LoadingView loading={isAuthLoading}>
        <Loader errorType="api">
          <View>
            <Text>Cloud</Text>
          </View>
        </Loader>
      </LoadingView>
    </PageWrapper>
  );
};

export default Cloud;
