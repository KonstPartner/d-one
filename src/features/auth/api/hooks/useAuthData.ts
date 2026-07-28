import { useIsMutating, useQuery } from '@tanstack/react-query';

import { authApi } from '@features/auth/api/authApi';
import { userQueryKeys } from '@features/auth/api/constants';
import { useAuth } from '@features/auth/model/context/AuthContext';

const EMPTY_UID = 'anonymous';

const useAuthData = () => {
  const { authUser, isAuthReady } = useAuth();

  const uid = authUser?.uid ?? EMPTY_UID;
  const hasAuthUser = Boolean(authUser);

  const query = useQuery({
    ...authApi.getUserDataOptions(uid),
    enabled: isAuthReady && hasAuthUser,
  });

  const authMutating =
    useIsMutating({
      mutationKey: userQueryKeys.userData(uid),
    }) > 0;

  const isAuthLoading =
    !isAuthReady || (hasAuthUser && (query.isPending || authMutating));

  const isAuthDataUnavailable =
    isAuthReady && hasAuthUser && query.isSuccess && query.data === null;

  return {
    authData: query.data ?? null,
    isAuthLoading,
    isAuthDataUnavailable,
    authMutating,

    ...query,
  };
};

export default useAuthData;
