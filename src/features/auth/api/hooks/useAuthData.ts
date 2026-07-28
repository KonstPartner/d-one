import { useIsMutating, useQuery } from '@tanstack/react-query';

import { authApi } from '@features/auth/api/authApi';
import { userQueryKeys } from '@features/auth/api/constants';
import { useAuth } from '@features/auth/model';

const useAuthData = () => {
  const { authUser, isAuthReady } = useAuth();

  const query = useQuery({
    ...authApi.getUserDataOptions(authUser),
    enabled: isAuthReady && Boolean(authUser),
  });

  const authMutating =
    useIsMutating({
      mutationKey: userQueryKeys.mutations,
    }) > 0;

  const isAuthLoading =
    !isAuthReady || (Boolean(authUser) && (query.isPending || authMutating));

  return {
    authData: query.data,
    isAuthLoading,
    authMutating,
    ...query,
  };
};

export default useAuthData;
