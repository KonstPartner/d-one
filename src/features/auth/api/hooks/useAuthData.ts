import { useIsMutating, useQuery } from '@tanstack/react-query';

import { authApi } from '@features/auth/api/authApi';
import { userQueryKeys } from '@features/auth/api/constants';
import { useAuth } from '@features/auth/model/context/AuthContext';

const useAuthData = () => {
  const { authUser, isAuthReady } = useAuth();

  const isAuthMutating =
    useIsMutating({
      mutationKey: userQueryKeys.mutations,
    }) > 0;

  const query = useQuery({
    ...authApi.getUserDataOptions(authUser),

    enabled: isAuthReady && Boolean(authUser) && !isAuthMutating,
  });

  const isAuthLoading =
    !isAuthReady || (Boolean(authUser) && (isAuthMutating || query.isPending));

  return {
    authData: query.data,
    isAuthLoading,
    isAuthMutating,
    ...query,
  };
};

export default useAuthData;
