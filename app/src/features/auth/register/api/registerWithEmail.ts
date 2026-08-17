import {
  createUserWithEmailAndPassword,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import {
  isUserProfile,
  saveLocalUserProfile,
  type UserProfile,
} from '@entities/user';
import { auth, db } from '@shared/api';

export type RegisterPayload = {
  nickname: string;
  email: string;
  password: string;
};

const createUserProfile = async (
  user: User,
  nickname: string
): Promise<UserProfile> => {
  const userRef = doc(db, 'users', user.uid);

  const profile: UserProfile = {
    uid: user.uid,
    email: user.email ?? '',
    nickname,
    role: null,
    followerUserIds: [],
    followedUserIds: [],
  };

  await setDoc(userRef, {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    throw new Error('custom/user-profile-was-not-created');
  }

  const createdProfile: unknown = snapshot.data();

  if (!isUserProfile(createdProfile)) {
    throw new Error('custom/invalid-user-profile');
  }

  return createdProfile;
};

export const registerWithEmail = async ({
  nickname,
  email,
  password,
}: RegisterPayload): Promise<UserProfile> => {
  const normalizedNickname = nickname.trim();
  const normalizedEmail = email.trim().toLowerCase();

  const credential = await createUserWithEmailAndPassword(
    auth,
    normalizedEmail,
    password
  );

  await updateProfile(credential.user, {
    displayName: normalizedNickname,
  });

  const profile = await createUserProfile(credential.user, normalizedNickname);

  await saveLocalUserProfile(profile);

  return profile;
};
