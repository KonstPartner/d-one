import {
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
} from 'firebase/auth';

import { saveLocalUserProfile } from '../../../../model/context/localProfileStorage';
import { auth } from '../../config';
import { getUserProfile } from '../getUserProfile';
import { loginWithGoogle } from '../loginWithGoogle';

jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: {
    credential: jest.fn(),
  },
  signInWithCredential: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('../../config', () => ({
  auth: {
    name: 'test-auth',
  },
}));

jest.mock('../getUserProfile', () => ({
  getUserProfile: jest.fn(),
}));

jest.mock('../../../../model/context/localProfileStorage', () => ({
  saveLocalUserProfile: jest.fn(),
}));

const mockedCredential = jest.mocked(GoogleAuthProvider.credential);
const mockedSignInWithCredential = jest.mocked(signInWithCredential);
const mockedSignOut = jest.mocked(signOut);
const mockedGetUserProfile = jest.mocked(getUserProfile);
const mockedSaveLocalUserProfile = jest.mocked(saveLocalUserProfile);

const credential = {
  providerId: 'google.com',
} as ReturnType<typeof GoogleAuthProvider.credential>;

const userCredential = {
  user: {
    uid: 'user-1',
  },
} as Awaited<ReturnType<typeof signInWithCredential>>;

const profile = {
  uid: 'user-1',
  email: 'user@example.com',
  nickname: 'User',
  role: 'user',
  followerUserIds: [],
  followedUserId: null,
} as const;

describe('loginWithGoogle', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedCredential.mockReturnValue(credential);
    mockedSignInWithCredential.mockResolvedValue(userCredential);
    mockedGetUserProfile.mockResolvedValue(profile);
    mockedSaveLocalUserProfile.mockResolvedValue(undefined);
    mockedSignOut.mockResolvedValue(undefined);
  });

  it('creates Google credential from id token', async () => {
    await loginWithGoogle('google-id-token');

    expect(mockedCredential).toHaveBeenCalledTimes(1);
    expect(mockedCredential).toHaveBeenCalledWith('google-id-token');
  });

  it('signs in to Firebase using generated credential', async () => {
    await loginWithGoogle('google-id-token');

    expect(mockedSignInWithCredential).toHaveBeenCalledTimes(1);
    expect(mockedSignInWithCredential).toHaveBeenCalledWith(auth, credential);
  });

  it('loads Firestore profile for authenticated user', async () => {
    await loginWithGoogle('google-id-token');

    expect(mockedGetUserProfile).toHaveBeenCalledTimes(1);
    expect(mockedGetUserProfile).toHaveBeenCalledWith(userCredential.user.uid);
  });

  it('saves loaded profile locally', async () => {
    await loginWithGoogle('google-id-token');

    expect(mockedSaveLocalUserProfile).toHaveBeenCalledTimes(1);
    expect(mockedSaveLocalUserProfile).toHaveBeenCalledWith(profile);
  });

  it('returns loaded user profile', async () => {
    const result = await loginWithGoogle('google-id-token');

    expect(result).toEqual(profile);
  });

  it('performs profile loading before local saving', async () => {
    await loginWithGoogle('google-id-token');

    const loadOrder = mockedGetUserProfile.mock.invocationCallOrder[0];

    const saveOrder = mockedSaveLocalUserProfile.mock.invocationCallOrder[0];

    expect(loadOrder).toBeLessThan(saveOrder);
  });

  it('signs out when Firestore profile does not exist', async () => {
    const error = new Error('custom/user-profile-not-found');

    mockedGetUserProfile.mockRejectedValue(error);

    await expect(loginWithGoogle('google-id-token')).rejects.toBe(error);

    expect(mockedSaveLocalUserProfile).not.toHaveBeenCalled();
    expect(mockedSignOut).toHaveBeenCalledTimes(1);
    expect(mockedSignOut).toHaveBeenCalledWith(auth);
  });

  it('signs out when local profile saving fails', async () => {
    const error = new Error('local-storage-failed');

    mockedSaveLocalUserProfile.mockRejectedValue(error);

    await expect(loginWithGoogle('google-id-token')).rejects.toBe(error);

    expect(mockedGetUserProfile).toHaveBeenCalledTimes(1);
    expect(mockedSignOut).toHaveBeenCalledWith(auth);
  });

  it('does not sign out when Firebase authentication itself fails', async () => {
    const error = new Error('firebase-login-failed');

    mockedSignInWithCredential.mockRejectedValue(error);

    await expect(loginWithGoogle('google-id-token')).rejects.toBe(error);

    expect(mockedGetUserProfile).not.toHaveBeenCalled();
    expect(mockedSaveLocalUserProfile).not.toHaveBeenCalled();
    expect(mockedSignOut).not.toHaveBeenCalled();
  });

  it('returns original profile error when sign out succeeds', async () => {
    const profileError = new Error('profile-failed');

    mockedGetUserProfile.mockRejectedValue(profileError);

    await expect(loginWithGoogle('google-id-token')).rejects.toBe(profileError);
  });
});
