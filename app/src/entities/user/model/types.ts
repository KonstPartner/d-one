export enum UserRole {
  User = 'user',
  Follower = 'follower',
}

export type UserProfile = {
  uid: string;
  email: string;
  nickname: string;
  role: UserRole | null;
  followerUserIds: string[];
  followedUserId: string | null;
};
