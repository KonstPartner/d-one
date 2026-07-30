import { Text, View } from 'react-native';

import { PageWrapper } from '@entities/layout/ui';
import { Loader, LoadingView } from '@entities/shared/ui';
import { useAuthData } from '@features/auth/api';
import { useNetwork } from '@features/network/model';

const Diary = () => {
  const { isAuthLoading } = useAuthData();
  const { status } = useNetwork();

  console.log(status);

  return (
    <PageWrapper>
      <LoadingView loading={isAuthLoading}>
        <Loader errorType="api">
          <View>
            <Text>Diary</Text>
          </View>
        </Loader>
      </LoadingView>
    </PageWrapper>
  );
};

export default Diary;
