import { User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { db } from '@features/auth/api/firebase/config';
import { UserData } from '@features/auth/model';

const getDefaultNickname = (user: User, registrationNickname?: string) => {
  const nickname = registrationNickname?.trim();

  if (nickname) {
    return nickname;
  }

  const displayName = user.displayName?.trim();

  if (displayName) {
    return displayName;
  }

  const emailPrefix = user.email?.split('@')[0]?.trim();

  return emailPrefix || 'user';
};

export const getOrCreateUserProfile = async (
  user: User,
  registrationNickname?: string
): Promise<UserData> => {
  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    return snapshot.data() as UserData;
  }

  const profile: UserData = {
    uid: user.uid,
    email: user.email ?? '',
    nickname: getDefaultNickname(user, registrationNickname),
    emailVerified: user.emailVerified,
    role: null,
    followerUserIds: [],
    followedUserId: null,
  };

  await setDoc(userRef, {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return profile;
};
