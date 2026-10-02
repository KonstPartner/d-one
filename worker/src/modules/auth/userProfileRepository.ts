import { z } from 'zod';

import { ApiError } from '../../shared/http/apiError';

export type UserRole = 'user' | 'follower' | null;

export type UserAuthorizationProfile = {
  uid: string;
  role: UserRole;
};

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
    throw new ApiError('AUTH_SERVICE_UNAVAILABLE');
  }

  if (response.status === 404) {
    throw new ApiError('USER_PROFILE_NOT_FOUND');
  }

  if (!response.ok) {
    throw new ApiError('AUTH_SERVICE_UNAVAILABLE');
  }

  let rawDocument: unknown;

  try {
    rawDocument = await response.json();
  } catch {
    throw new ApiError('AUTH_SERVICE_UNAVAILABLE');
  }

  const parsedDocument = userAuthorizationDocumentSchema.safeParse(rawDocument);

  if (!parsedDocument.success) {
    throw new ApiError('AUTH_SERVICE_UNAVAILABLE');
  }

  const profileUid = parsedDocument.data.fields.uid.stringValue;

  if (profileUid !== uid) {
    throw new ApiError('AUTH_SERVICE_UNAVAILABLE');
  }

  return {
    uid: profileUid,
    role: getRole(parsedDocument.data.fields.role),
  };
};
