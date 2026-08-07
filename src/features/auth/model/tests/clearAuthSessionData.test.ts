import { queryClient } from '@features/shared/api';

import { userQueryKeys } from '../../api/authMutationKeys';
import { removeLocalUserProfile } from '../context/localProfileStorage';
import { clearAuthSessionData } from '../utils/clearAuthSessionData';

jest.mock('@features/shared/api', () => ({
  queryClient: {
    cancelQueries: jest.fn(),
    removeQueries: jest.fn(),
  },
}));

jest.mock('../context/localProfileStorage', () => ({
  removeLocalUserProfile: jest.fn(),
}));

const mockedCancelQueries = jest.mocked(queryClient.cancelQueries);
const mockedRemoveQueries = jest.mocked(queryClient.removeQueries);
const mockedRemoveLocalUserProfile = jest.mocked(removeLocalUserProfile);

describe('clearAuthSessionData', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedCancelQueries.mockResolvedValue(undefined);
    mockedRemoveQueries.mockReturnValue(undefined);
    mockedRemoveLocalUserProfile.mockResolvedValue(undefined);
  });

  it('cancels auth queries, removes them and clears local profile', async () => {
    await clearAuthSessionData();

    expect(mockedCancelQueries).toHaveBeenCalledTimes(1);
    expect(mockedCancelQueries).toHaveBeenCalledWith({
      queryKey: userQueryKeys.userDataRoot,
    });

    expect(mockedRemoveQueries).toHaveBeenCalledTimes(1);
    expect(mockedRemoveQueries).toHaveBeenCalledWith({
      queryKey: userQueryKeys.userDataRoot,
    });

    expect(mockedRemoveLocalUserProfile).toHaveBeenCalledTimes(1);
  });

  it('performs cleanup in the correct order', async () => {
    await clearAuthSessionData();

    const cancelQueriesOrder = mockedCancelQueries.mock.invocationCallOrder[0];

    const removeQueriesOrder = mockedRemoveQueries.mock.invocationCallOrder[0];

    const removeProfileOrder =
      mockedRemoveLocalUserProfile.mock.invocationCallOrder[0];

    expect(cancelQueriesOrder).toBeLessThan(removeQueriesOrder);
    expect(removeQueriesOrder).toBeLessThan(removeProfileOrder);
  });

  it('stops cleanup when query cancellation fails', async () => {
    const error = new Error('cancel failed');

    mockedCancelQueries.mockRejectedValue(error);

    await expect(clearAuthSessionData()).rejects.toBe(error);

    expect(mockedRemoveQueries).not.toHaveBeenCalled();
    expect(mockedRemoveLocalUserProfile).not.toHaveBeenCalled();
  });

  it('does not remove local profile when removing queries fails', async () => {
    const error = new Error('remove queries failed');

    mockedRemoveQueries.mockImplementation(() => {
      throw error;
    });

    await expect(clearAuthSessionData()).rejects.toBe(error);

    expect(mockedCancelQueries).toHaveBeenCalledTimes(1);
    expect(mockedRemoveLocalUserProfile).not.toHaveBeenCalled();
  });
});
