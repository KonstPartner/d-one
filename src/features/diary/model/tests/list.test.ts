import { dateKit } from '@features/shared/model';

import { buildDiaryListItems, getDiaryDayKey } from '../list';
import type { DiaryEntry } from '../types';

jest.mock('@features/shared/model', () => ({
  dateKit: {
    format: jest.fn(),
    formatParts: jest.fn(),
  },
}));

const mockedFormat = jest.mocked(dateKit.format);
const mockedFormatParts = jest.mocked(dateKit.formatParts);

const createEntry = (id: string, eventAt: Date): DiaryEntry => ({
  id,
  userId: 'user-1',
  glucose: null,
  mealRelation: null,
  shortInsulin: null,
  longInsulin: null,
  carbsGram: null,
  comment: id,
  aiAnalysis: '',
  localPhotoUri: null,
  photoPath: null,
  photoUrl: null,
  eventAt,
  syncStatus: 'synced',
});

describe('diary list', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedFormatParts.mockImplementation((value) => {
      const date = value as Date;

      return {
        year: String(date.getFullYear()),
        month: String(date.getMonth() + 1).padStart(2, '0'),
        day: String(date.getDate()).padStart(2, '0'),
        hour: '',
        minute: '',
        second: '',
        formatted: '',
        formattedDate: '',
        formattedTime: '',
      };
    });

    mockedFormat.mockImplementation((value) => {
      const date = value as Date;

      return `title:${date.getTime()}`;
    });
  });

  it('builds day key from dateKit parts', () => {
    const eventAt = new Date('2026-08-01T00:05:00.000Z');

    mockedFormatParts.mockReturnValueOnce({
      year: '2026',
      month: '08',
      day: '01',
      hour: '02',
      minute: '05',
      second: '00',
      formatted: '',
      formattedDate: '',
      formattedTime: '',
    });

    expect(getDiaryDayKey(eventAt)).toBe('2026-08-01');
    expect(mockedFormatParts).toHaveBeenCalledWith(eventAt);
  });

  it('groups entries by day and preserves their order', () => {
    const firstEntry = createEntry('entry-1', new Date(2026, 6, 31, 18, 30));
    const secondEntry = createEntry('entry-2', new Date(2026, 6, 31, 8, 15));
    const thirdEntry = createEntry('entry-3', new Date(2026, 6, 30, 22, 0));

    const result = buildDiaryListItems({
      entries: [firstEntry, secondEntry, thirdEntry],
      collapsedDayKeys: new Set(),
    });

    expect(result).toEqual([
      {
        type: 'dayHeader',
        dayKey: '2026-07-31',
        title: `title:${firstEntry.eventAt.getTime()}`,
        entriesCount: 2,
      },
      {
        type: 'entry',
        entry: firstEntry,
      },
      {
        type: 'entry',
        entry: secondEntry,
      },
      {
        type: 'dayHeader',
        dayKey: '2026-07-30',
        title: `title:${thirdEntry.eventAt.getTime()}`,
        entriesCount: 1,
      },
      {
        type: 'entry',
        entry: thirdEntry,
      },
    ]);

    expect(mockedFormat).toHaveBeenNthCalledWith(1, firstEntry.eventAt, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    expect(mockedFormat).toHaveBeenNthCalledWith(2, thirdEntry.eventAt, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  });

  it('keeps the header but excludes entries of a collapsed day', () => {
    const firstEntry = createEntry('entry-1', new Date(2026, 6, 31, 18, 30));
    const secondEntry = createEntry('entry-2', new Date(2026, 6, 31, 8, 15));
    const thirdEntry = createEntry('entry-3', new Date(2026, 6, 30, 22, 0));

    const result = buildDiaryListItems({
      entries: [firstEntry, secondEntry, thirdEntry],
      collapsedDayKeys: new Set(['2026-07-31']),
    });

    expect(result).toEqual([
      {
        type: 'dayHeader',
        dayKey: '2026-07-31',
        title: `title:${firstEntry.eventAt.getTime()}`,
        entriesCount: 2,
      },
      {
        type: 'dayHeader',
        dayKey: '2026-07-30',
        title: `title:${thirdEntry.eventAt.getTime()}`,
        entriesCount: 1,
      },
      {
        type: 'entry',
        entry: thirdEntry,
      },
    ]);
  });

  it('returns an empty list when there are no entries', () => {
    expect(
      buildDiaryListItems({
        entries: [],
        collapsedDayKeys: new Set(),
      })
    ).toEqual([]);

    expect(mockedFormat).not.toHaveBeenCalled();
    expect(mockedFormatParts).not.toHaveBeenCalled();
  });
});
