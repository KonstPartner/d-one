import { signOut } from 'firebase/auth';

import { auth } from '@features/auth/api/firebase/config';

export const logoutUser = () => signOut(auth);
