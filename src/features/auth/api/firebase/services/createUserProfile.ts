import { User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import type { UserData } from '../../../model/types/auth';
import { db } from '../config';

export const createUserProfile = async (
  user: User,
  nickname: string
): Promise<UserData> => {
  const userRef = doc(db, 'users', user.uid);

  const userData = {
    uid: user.uid,
    email: user.email ?? '',
    nickname: nickname.trim(),
    role: null,
    followerUserIds: [],
    followedUserId: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(userRef, userData);

  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    throw new Error('custom/user-profile-was-not-created');
  }

  return snapshot.data() as UserData;
};
