import { useIsMutating, useQuery } from '@tanstack/react-query';

import { useSession } from '@entities/session';

import { authApi } from '../authApi';
import { userQueryKeys } from '../constants';

const useAuthData = () => {
  const { sessionUser, isSessionReady } = useSession();

  const isAuthMutating =
    useIsMutating({
      mutationKey: userQueryKeys.mutations,
    }) > 0;

  const query = useQuery({
    ...authApi.getUserDataOptions(sessionUser),

    enabled: isSessionReady && Boolean(sessionUser) && !isAuthMutating,
  });

  const isAuthLoading =
    !isSessionReady ||
    (Boolean(sessionUser) && (isAuthMutating || query.isPending));

  return {
    authData: query.data,
    isAuthLoading,
    isAuthMutating,
    ...query,
  };
};

export default useAuthData;
