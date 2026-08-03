import { SaveFormat } from 'expo-image-manipulator';

import {
  createDiaryPhotoDraft,
  DiaryPhotoError,
  prepareDiaryPhotoForEntry,
  prepareDiaryPhotoRemoval,
  removeDiaryPhotoDraft,
} from '../diaryPhotoService';

const mockManipulate = jest.fn();
const mockSourceRenderAsync = jest.fn();
const mockResize = jest.fn();
const mockResizedRenderAsync = jest.fn();
const mockSaveAsync = jest.fn();

jest.mock('expo-file-system', () => {
  type MockStoredFile = {
    size: number;
    content: string;
  };

  const mockFiles = new Map<string, MockStoredFile>();
  const mockOperations: string[] = [];
  const mockCopyFailures = new Set<string>();
  const mockDeleteFailures = new Set<string>();

  const mockJoinUri = (...parts: Array<string | { uri: string }>): string => {
    const values = parts.map((part) =>
      typeof part === 'string' ? part : part.uri
    );
    const [first = '', ...rest] = values;

    return [
      first.replace(/\/$/, ''),
      ...rest.map((part) => part.replace(/^\//, '')),
    ]
      .filter((part) => part.length > 0)
      .join('/');
  };

  class MockDirectory {
    public readonly uri: string;

    public constructor(...parts: Array<string | { uri: string }>) {
      this.uri = mockJoinUri(...parts);
    }

    public create(): void {
      mockOperations.push(`mkdir:${this.uri}`);
    }
  }

  class MockFile {
    public readonly uri: string;

    public constructor(...parts: Array<string | { uri: string }>) {
      this.uri = mockJoinUri(...parts);
    }

    public get exists(): boolean {
      return mockFiles.has(this.uri);
    }

    public get size(): number {
      return mockFiles.get(this.uri)?.size ?? 0;
    }

    public copy(destination: MockFile): void {
      mockOperations.push(`copy:${this.uri}->${destination.uri}`);

      if (mockCopyFailures.delete(destination.uri)) {
        throw new Error(`Copy failed: ${destination.uri}`);
      }

      const source = mockFiles.get(this.uri);

      if (source === undefined) {
        throw new Error(`Source does not exist: ${this.uri}`);
      }

      mockFiles.set(destination.uri, { ...source });
    }

    public delete(): void {
      mockOperations.push(`delete:${this.uri}`);

      if (mockDeleteFailures.delete(this.uri)) {
        throw new Error(`Delete failed: ${this.uri}`);
      }

      mockFiles.delete(this.uri);
    }
  }

  return {
    Directory: MockDirectory,
    File: MockFile,
    Paths: {
      cache: 'file:///cache',
      document: 'file:///document',
    },
    __mockFileSystem: {
      reset: () => {
        mockFiles.clear();
        mockOperations.length = 0;
        mockCopyFailures.clear();
        mockDeleteFailures.clear();
      },
      setFile: (uri: string, size: number, content: string = uri): void => {
        mockFiles.set(uri, {
          size,
          content,
        });
      },
      getFile: (uri: string): MockStoredFile | undefined => mockFiles.get(uri),
      hasFile: (uri: string): boolean => mockFiles.has(uri),
      getUris: (): string[] => [...mockFiles.keys()],
      getOperations: (): string[] => [...mockOperations],
      failNextCopyTo: (uri: string): void => {
        mockCopyFailures.add(uri);
      },
      failNextDelete: (uri: string): void => {
        mockDeleteFailures.add(uri);
      },
    },
  };
});

jest.mock('expo-image-manipulator', () => ({
  ImageManipulator: {
    manipulate: (...args: unknown[]) => mockManipulate(...args),
  },
  SaveFormat: {
    JPEG: 'jpeg',
  },
}));

type MockFileSystem = {
  reset: () => void;
  setFile: (uri: string, size: number, content?: string) => void;
  getFile: (uri: string) =>
    | {
        size: number;
        content: string;
      }
    | undefined;
  hasFile: (uri: string) => boolean;
  getUris: () => string[];
  getOperations: () => string[];
  failNextCopyTo: (uri: string) => void;
  failNextDelete: (uri: string) => void;
};

const { __mockFileSystem: mockFileSystem } = jest.requireMock(
  'expo-file-system'
) as {
  __mockFileSystem: MockFileSystem;
};

const SOURCE_URI = 'file:///picker/source.png';
const DRAFT_URI = 'file:///cache/generated-photo.jpg';
const DESTINATION_URI = 'file:///document/users/user-1/diaryPhotos/entry-1.jpg';

const findBackupUri = (): string | undefined =>
  mockFileSystem
    .getUris()
    .find((uri) => uri.startsWith('file:///cache/diary-photo-backups/'));

describe('diaryPhotoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFileSystem.reset();

    const sourceImage = {
      width: 1000,
      height: 750,
      saveAsync: mockSaveAsync,
    };
    const resizedImage = {
      width: 1280,
      height: 640,
      saveAsync: mockSaveAsync,
    };

    mockSourceRenderAsync.mockResolvedValue(sourceImage);
    mockResizedRenderAsync.mockResolvedValue(resizedImage);
    mockSaveAsync.mockImplementation(async () => {
      mockFileSystem.setFile(DRAFT_URI, 250_000, 'normalized-photo');

      return {
        uri: DRAFT_URI,
        width: resizedImage.width,
        height: resizedImage.height,
      };
    });
    mockManipulate.mockImplementation((source: unknown) => {
      if (typeof source === 'string') {
        return {
          renderAsync: mockSourceRenderAsync,
        };
      }

      return {
        resize: mockResize,
        renderAsync: mockResizedRenderAsync,
      };
    });
  });

  it('normalizes a valid image to JPEG without enlarging it', async () => {
    mockSaveAsync.mockImplementationOnce(async () => {
      mockFileSystem.setFile(DRAFT_URI, 200_000, 'normalized-photo');

      return {
        uri: DRAFT_URI,
        width: 1000,
        height: 750,
      };
    });

    await expect(createDiaryPhotoDraft(SOURCE_URI)).resolves.toEqual({
      uri: DRAFT_URI,
      width: 1000,
      height: 750,
      size: 200_000,
    });

    expect(mockManipulate).toHaveBeenCalledTimes(1);
    expect(mockResize).not.toHaveBeenCalled();
    expect(mockSaveAsync).toHaveBeenCalledWith({
      format: SaveFormat.JPEG,
      compress: 0.85,
    });
  });

  it('limits the longest image edge to 1280 pixels', async () => {
    mockSourceRenderAsync.mockResolvedValueOnce({
      width: 2400,
      height: 1200,
      saveAsync: mockSaveAsync,
    });

    const result = await createDiaryPhotoDraft(SOURCE_URI);

    expect(mockManipulate).toHaveBeenCalledTimes(2);
    expect(mockResize).toHaveBeenCalledWith({
      width: 1280,
      height: null,
    });
    expect(result).toEqual({
      uri: DRAFT_URI,
      width: 1280,
      height: 640,
      size: 250_000,
    });
  });

  it('deletes an oversized normalized temporary file', async () => {
    mockSaveAsync.mockImplementationOnce(async () => {
      mockFileSystem.setFile(
        DRAFT_URI,
        10 * 1024 * 1024 + 1,
        'oversized-photo'
      );

      return {
        uri: DRAFT_URI,
        width: 1280,
        height: 720,
      };
    });

    await expect(createDiaryPhotoDraft(SOURCE_URI)).rejects.toMatchObject({
      name: 'DiaryPhotoError',
      code: 'fileTooLarge',
    });

    expect(mockFileSystem.hasFile(DRAFT_URI)).toBe(false);
    expect(mockFileSystem.getOperations()).toContain(`delete:${DRAFT_URI}`);
  });

  it('maps image processing failures to a stable error', async () => {
    mockSourceRenderAsync.mockRejectedValueOnce(new Error('Decoder failed'));

    await expect(createDiaryPhotoDraft(SOURCE_URI)).rejects.toEqual(
      new DiaryPhotoError('processingFailed')
    );
  });

  it('moves a draft into permanent storage and cleans it after finalize', () => {
    mockFileSystem.setFile(DRAFT_URI, 250_000, 'new-photo');

    const preparedPhoto = prepareDiaryPhotoForEntry({
      userId: 'user-1',
      entryId: 'entry-1',
      draftUri: DRAFT_URI,
    });

    expect(preparedPhoto.localPhotoUri).toBe(DESTINATION_URI);
    expect(preparedPhoto.photoPath).toBe(
      'users/user-1/diaryPhotos/entry-1.jpg'
    );
    expect(mockFileSystem.getFile(DESTINATION_URI)?.content).toBe('new-photo');

    preparedPhoto.finalize();
    preparedPhoto.finalize();

    expect(mockFileSystem.hasFile(DRAFT_URI)).toBe(false);
    expect(findBackupUri()).toBeUndefined();
  });

  it('restores the previous photo when replacement is rolled back', () => {
    mockFileSystem.setFile(DRAFT_URI, 250_000, 'new-photo');
    mockFileSystem.setFile(DESTINATION_URI, 180_000, 'old-photo');

    const preparedPhoto = prepareDiaryPhotoForEntry({
      userId: 'user-1',
      entryId: 'entry-1',
      draftUri: DRAFT_URI,
    });

    expect(mockFileSystem.getFile(DESTINATION_URI)?.content).toBe('new-photo');
    expect(findBackupUri()).toBeDefined();

    preparedPhoto.rollback();
    preparedPhoto.rollback();

    expect(mockFileSystem.getFile(DESTINATION_URI)?.content).toBe('old-photo');
    expect(mockFileSystem.hasFile(DRAFT_URI)).toBe(true);
    expect(findBackupUri()).toBeUndefined();
  });

  it('removes a partial destination when copying a new photo fails', () => {
    mockFileSystem.setFile(DRAFT_URI, 250_000, 'new-photo');
    mockFileSystem.failNextCopyTo(DESTINATION_URI);

    expect(() =>
      prepareDiaryPhotoForEntry({
        userId: 'user-1',
        entryId: 'entry-1',
        draftUri: DRAFT_URI,
      })
    ).toThrow(new DiaryPhotoError('storageFailed'));

    expect(mockFileSystem.hasFile(DESTINATION_URI)).toBe(false);
    expect(findBackupUri()).toBeUndefined();
    expect(mockFileSystem.hasFile(DRAFT_URI)).toBe(true);
  });

  it('finalizes and rolls back prepared photo removal safely', () => {
    mockFileSystem.setFile(DESTINATION_URI, 180_000, 'old-photo');

    const firstRemoval = prepareDiaryPhotoRemoval({
      userId: 'user-1',
      entryId: 'entry-1',
    });

    expect(mockFileSystem.hasFile(DESTINATION_URI)).toBe(false);
    expect(findBackupUri()).toBeDefined();

    firstRemoval.rollback();

    expect(mockFileSystem.getFile(DESTINATION_URI)?.content).toBe('old-photo');
    expect(findBackupUri()).toBeUndefined();

    const secondRemoval = prepareDiaryPhotoRemoval({
      userId: 'user-1',
      entryId: 'entry-1',
    });

    secondRemoval.finalize();
    secondRemoval.finalize();

    expect(mockFileSystem.hasFile(DESTINATION_URI)).toBe(false);
    expect(findBackupUri()).toBeUndefined();
  });

  it('removes a draft idempotently and rejects unsafe identifiers', () => {
    mockFileSystem.setFile(DRAFT_URI, 250_000, 'draft-photo');

    removeDiaryPhotoDraft(DRAFT_URI);
    removeDiaryPhotoDraft(DRAFT_URI);

    expect(mockFileSystem.hasFile(DRAFT_URI)).toBe(false);
    expect(() =>
      prepareDiaryPhotoForEntry({
        userId: '../other-user',
        entryId: 'entry-1',
        draftUri: DRAFT_URI,
      })
    ).toThrow(new DiaryPhotoError('storageFailed'));
  });
});
