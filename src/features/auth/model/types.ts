export enum UserRole {
  User = 'user',
  Follower = 'follower',
}

export type AuthUserData = {
  uid: string;
  email: string;
  nickname: string;
  emailVerified: boolean;
  role: UserRole | null;
  followerUserIds: string[];
  followedUserId: string | null;
};
