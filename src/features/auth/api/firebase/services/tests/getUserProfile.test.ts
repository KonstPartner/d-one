import { doc, getDoc } from 'firebase/firestore';

import { db } from '../../config';
import { getUserProfile } from '../getUserProfile';

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

jest.mock('../../config', () => ({
  db: {
    name: 'test-database',
  },
}));

const mockedDoc = jest.mocked(doc);
const mockedGetDoc = jest.mocked(getDoc);

const documentReference = {
  path: 'users/user-1',
} as ReturnType<typeof doc>;

const profile = {
  uid: 'user-1',
  email: 'user@example.com',
  nickname: 'User',
  role: 'user',
  followerUserIds: [],
  followedUserId: null,
} as const;

describe('getUserProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedDoc.mockReturnValue(documentReference);
  });

  it('creates reference to users document', async () => {
    mockedGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => profile,
    } as Awaited<ReturnType<typeof getDoc>>);

    await getUserProfile('user-1');

    expect(mockedDoc).toHaveBeenCalledTimes(1);
    expect(mockedDoc).toHaveBeenCalledWith(db, 'users', 'user-1');
  });

  it('loads document using created reference', async () => {
    mockedGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => profile,
    } as Awaited<ReturnType<typeof getDoc>>);

    await getUserProfile('user-1');

    expect(mockedGetDoc).toHaveBeenCalledTimes(1);
    expect(mockedGetDoc).toHaveBeenCalledWith(documentReference);
  });

  it('returns profile from existing document', async () => {
    mockedGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => profile,
    } as Awaited<ReturnType<typeof getDoc>>);

    const result = await getUserProfile('user-1');

    expect(result).toEqual(profile);
  });

  it('throws custom error when profile document does not exist', async () => {
    mockedGetDoc.mockResolvedValue({
      exists: () => false,
      data: jest.fn(),
    } as unknown as Awaited<ReturnType<typeof getDoc>>);

    await expect(getUserProfile('user-1')).rejects.toThrow(
      'custom/user-profile-not-found'
    );
  });

  it('does not read document data when document does not exist', async () => {
    const data = jest.fn();

    mockedGetDoc.mockResolvedValue({
      exists: () => false,
      data,
    } as unknown as Awaited<ReturnType<typeof getDoc>>);

    await expect(getUserProfile('user-1')).rejects.toThrow();

    expect(data).not.toHaveBeenCalled();
  });

  it('propagates Firestore request error', async () => {
    const error = {
      code: 'permission-denied',
    };

    mockedGetDoc.mockRejectedValue(error);

    await expect(getUserProfile('user-1')).rejects.toBe(error);
  });
});
