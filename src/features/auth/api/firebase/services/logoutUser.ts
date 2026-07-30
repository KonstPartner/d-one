import { signOut } from 'firebase/auth';

import { auth } from '../config';

export const logoutUser = () => signOut(auth);
