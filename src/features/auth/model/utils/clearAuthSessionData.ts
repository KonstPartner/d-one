import { userQueryKeys } from '@features/auth/api/constants';
import { removeLocalUserProfile } from '@features/auth/model/context/localProfileStorage';
import { queryClient } from '@features/shared/api';

export const clearAuthSessionData = async (): Promise<void> => {
  await queryClient.cancelQueries({
    queryKey: userQueryKeys.userDataRoot,
  });

  queryClient.removeQueries({
    queryKey: userQueryKeys.userDataRoot,
  });

  await removeLocalUserProfile();
};
