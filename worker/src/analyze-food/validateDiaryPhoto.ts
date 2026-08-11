const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

const ALLOWED_FIREBASE_STORAGE_HOSTS = new Set([
  'firebasestorage.googleapis.com',
]);

export type PhotoValidationErrorCode =
  | 'INVALID_IMAGE_URL'
  | 'IMAGE_NOT_ANALYZABLE'
  | 'IMAGE_TOO_LARGE';

export class PhotoValidationError extends Error {
  public constructor(public readonly code: PhotoValidationErrorCode) {
    super(code);
    this.name = 'PhotoValidationError';
  }
}

type ValidateDiaryPhotoParams = {
  uid: string;
  entryId: string;
  photoPath: string;
  photoUrl: string;
  storageBucket: string;
};

export type ValidatedDiaryPhoto = {
  url: string;
  contentType: 'image/jpeg';
  sizeBytes: number | null;
};

const getExpectedPhotoPath = (uid: string, entryId: string): string =>
  `users/${uid}/diaryPhotos/${entryId}.jpg`;

const decodeStorageObjectPath = (pathname: string): string | null => {
  const segments = pathname.split('/');

  const objectIndex = segments.indexOf('o');

  if (objectIndex === -1) {
    return null;
  }

  const encodedPath = segments[objectIndex + 1];

  if (encodedPath === undefined || encodedPath.length === 0) {
    return null;
  }

  try {
    return decodeURIComponent(encodedPath);
  } catch {
    return null;
  }
};

const parseContentLength = (value: string | null): number | null => {
  if (value === null) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
};

export const validateDiaryPhoto = async ({
  uid,
  entryId,
  photoPath,
  photoUrl,
  storageBucket,
}: ValidateDiaryPhotoParams): Promise<ValidatedDiaryPhoto> => {
  const expectedPhotoPath = getExpectedPhotoPath(uid, entryId);

  if (photoPath !== expectedPhotoPath) {
    throw new PhotoValidationError('INVALID_IMAGE_URL');
  }

  let url: URL;

  try {
    url = new URL(photoUrl);
  } catch {
    throw new PhotoValidationError('INVALID_IMAGE_URL');
  }

  if (url.protocol !== 'https:') {
    throw new PhotoValidationError('INVALID_IMAGE_URL');
  }

  if (!ALLOWED_FIREBASE_STORAGE_HOSTS.has(url.hostname)) {
    throw new PhotoValidationError('INVALID_IMAGE_URL');
  }

  const pathSegments = url.pathname.split('/');

  const bucketIndex = pathSegments.indexOf('b');

  const bucket =
    bucketIndex === -1 ? null : (pathSegments[bucketIndex + 1] ?? null);

  if (bucket !== storageBucket) {
    throw new PhotoValidationError('INVALID_IMAGE_URL');
  }

  const objectPath = decodeStorageObjectPath(url.pathname);

  if (objectPath !== expectedPhotoPath) {
    throw new PhotoValidationError('INVALID_IMAGE_URL');
  }

  let response: Response;

  try {
    response = await fetch(url, {
      method: 'HEAD',
      redirect: 'manual',
    });
  } catch {
    throw new PhotoValidationError('IMAGE_NOT_ANALYZABLE');
  }

  if (response.status >= 300 && response.status < 400) {
    throw new PhotoValidationError('INVALID_IMAGE_URL');
  }

  if (!response.ok) {
    throw new PhotoValidationError('IMAGE_NOT_ANALYZABLE');
  }

  const contentType = response.headers
    .get('content-type')
    ?.split(';')[0]
    ?.trim()
    .toLowerCase();

  if (contentType !== 'image/jpeg') {
    throw new PhotoValidationError('IMAGE_NOT_ANALYZABLE');
  }

  const sizeBytes = parseContentLength(response.headers.get('content-length'));

  if (sizeBytes !== null && sizeBytes > MAX_IMAGE_SIZE_BYTES) {
    throw new PhotoValidationError('IMAGE_TOO_LARGE');
  }

  return {
    url: url.toString(),
    contentType: 'image/jpeg',
    sizeBytes,
  };
};
