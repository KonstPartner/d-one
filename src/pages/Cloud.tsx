import { Text, View } from 'react-native';

import { PageWrapper } from '@entities/layout/ui';
import { Loader, LoadingView } from '@entities/shared/ui';
import { useAuthData } from '@features/auth/api';

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
