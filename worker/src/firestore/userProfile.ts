import { z } from 'zod';

export type UserRole = 'user' | 'follower' | null;

export type UserAuthorizationProfile = {
  uid: string;
  role: UserRole;
};

export type UserProfileErrorCode =
  | 'USER_PROFILE_NOT_FOUND'
  | 'INVALID_USER_PROFILE'
  | 'AUTH_SERVICE_UNAVAILABLE';

export class UserProfileError extends Error {
  public constructor(public readonly code: UserProfileErrorCode) {
    super(code);
    this.name = 'UserProfileError';
  }
}

const firestoreStringValueSchema = z.object({
  stringValue: z.string(),
});

const firestoreRoleValueSchema = z.union([
  z.object({
    stringValue: z.enum(['user', 'follower']),
  }),

  z.object({
    nullValue: z.null(),
  }),
]);

const userAuthorizationDocumentSchema = z.object({
  fields: z.object({
    uid: firestoreStringValueSchema,
    role: firestoreRoleValueSchema,
  }),
});

const getRole = (value: z.infer<typeof firestoreRoleValueSchema>): UserRole =>
  'stringValue' in value ? value.stringValue : null;

export const getUserAuthorizationProfile = async ({
  projectId,
  uid,
  idToken,
}: {
  projectId: string;
  uid: string;
  idToken: string;
}): Promise<UserAuthorizationProfile> => {
  const url = new URL(
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
      projectId,
    )}/databases/(default)/documents/users/${encodeURIComponent(uid)}`,
  );

  url.searchParams.append('mask.fieldPaths', 'uid');

  url.searchParams.append('mask.fieldPaths', 'role');

  let response: Response;

  try {
    response = await fetch(url, {
      method: 'GET',

      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${idToken}`,
      },

      redirect: 'manual',
    });
  } catch {
    throw new UserProfileError('AUTH_SERVICE_UNAVAILABLE');
  }

  if (response.status === 404) {
    throw new UserProfileError('USER_PROFILE_NOT_FOUND');
  }

  if (!response.ok) {
    throw new UserProfileError('AUTH_SERVICE_UNAVAILABLE');
  }

  let rawDocument: unknown;

  try {
    rawDocument = await response.json();
  } catch {
    throw new UserProfileError('INVALID_USER_PROFILE');
  }

  const parsedDocument = userAuthorizationDocumentSchema.safeParse(rawDocument);

  if (!parsedDocument.success) {
    throw new UserProfileError('INVALID_USER_PROFILE');
  }

  const profileUid = parsedDocument.data.fields.uid.stringValue;

  if (profileUid !== uid) {
    throw new UserProfileError('INVALID_USER_PROFILE');
  }

  return {
    uid: profileUid,
    role: getRole(parsedDocument.data.fields.role),
  };
};
