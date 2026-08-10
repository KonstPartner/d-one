import { collection, getDocs, limit, query, where } from 'firebase/firestore';

import { db } from '@shared/api/firebase';

type CheckUserExistsResult = {
  isExists: boolean;
};

export const checkUserExistsByEmail = async (
  email: string
): Promise<CheckUserExistsResult> => {
  const normalizedEmail = email.trim().toLowerCase();

  const usersQuery = query(
    collection(db, 'users'),
    where('email', '==', normalizedEmail),
    limit(1)
  );

  const snapshot = await getDocs(usersQuery);

  return {
    isExists: !snapshot.empty,
  };
};
