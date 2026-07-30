import { queryClient } from '@features/shared/api';

import { userQueryKeys } from '../../api/constants';
import { removeLocalUserProfile } from '../context/localProfileStorage';

export const clearAuthSessionData = async (): Promise<void> => {
  await queryClient.cancelQueries({
    queryKey: userQueryKeys.userDataRoot,
  });

  queryClient.removeQueries({
    queryKey: userQueryKeys.userDataRoot,
  });

  await removeLocalUserProfile();
};
