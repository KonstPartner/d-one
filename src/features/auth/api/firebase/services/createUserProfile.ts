import type { User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { isUserProfile, type UserProfile } from '@entities/user';
import { db } from '@shared/api/firebase';

export const createUserProfile = async (
  user: User,
  nickname: string
): Promise<UserProfile> => {
  const userRef = doc(db, 'users', user.uid);

  const profile: UserProfile = {
    uid: user.uid,
    email: user.email ?? '',
    nickname: nickname.trim(),
    role: null,
    followerUserIds: [],
    followedUserId: null,
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
