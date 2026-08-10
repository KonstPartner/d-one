import { type UserProfile, UserRole } from './types';

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) &&
  value.every((item) => typeof item === 'string' && item.length > 0);

const isUserRole = (value: unknown): value is UserProfile['role'] =>
  value === null || value === UserRole.User || value === UserRole.Follower;

export const isUserProfile = (value: unknown): value is UserProfile => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const profile = value as Record<string, unknown>;

  const followedUserIdIsValid =
    profile.followedUserId === null ||
    typeof profile.followedUserId === 'string';

  return (
    typeof profile.uid === 'string' &&
    profile.uid.length > 0 &&
    typeof profile.email === 'string' &&
    typeof profile.nickname === 'string' &&
    isUserRole(profile.role) &&
    isStringArray(profile.followerUserIds) &&
    followedUserIdIsValid
  );
};
