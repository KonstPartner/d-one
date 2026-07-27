import { useIsMutating, useQuery } from '@tanstack/react-query';

import { authApi } from '@features/auth/api/authApi';
import { userQueryKeys } from '@features/auth/api/constants';
import { useAuth } from '@features/auth/model/context/AuthContext';

const useAuthData = () => {
  const { authUser, isAuthReady } = useAuth();

  const query = useQuery({
    ...authApi.getUserDataOptions(),
    enabled: isAuthReady && !!authUser,
  });

  const authMutating =
    useIsMutating({ mutationKey: userQueryKeys.userData }) > 0;

  const isAuthLoading =
    !isAuthReady ||
    (isAuthReady && !!authUser && (query.isLoading || authMutating));

  return {
    authData: query.data,
    isAuthLoading,
    ...query,
    authMutating,
  };
};

export default useAuthData;
