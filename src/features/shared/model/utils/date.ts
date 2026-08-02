import { getLocales } from 'expo-localization';

import { i18n } from '@features/i18n/model';

export type DateInput = string | number | Date | null | undefined;

export type DateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

export type FormattedDateParts = {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  second: string;
  formatted: string;
  formattedDate: string;
  formattedTime: string;
};

export type DateKitInstance = ReturnType<typeof createDateKit>;

const isValidDate = (value: unknown): value is Date =>
  value instanceof Date && !Number.isNaN(value.getTime());

const getPartsInZone = (date: Date, timeZone: string): DateParts => {
  const parts = new Intl.DateTimeFormat('en-CA-u-ca-gregory-nu-latn', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date);

  const map: Record<string, string> = {};

  for (const part of parts) {
    if (part.type !== 'literal') {
      map[part.type] = part.value;
    }
  }

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
  };
};

const getTimeZoneOffsetMs = (timeZone: string, date: Date): number => {
  const zoned = getPartsInZone(date, timeZone);

  const utcTs = Date.UTC(
    zoned.year,
    zoned.month - 1,
    zoned.day,
    zoned.hour,
    zoned.minute,
    zoned.second,
    0
  );

  return utcTs - date.getTime();
};

const getLocalOffsetMs = (date: Date): number =>
  -date.getTimezoneOffset() * 60_000;

const DAY_MS = 86_400_000;

const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);

export const createDateKit = (realNow?: DateInput) => {
  const locale = getLocales()[0]?.languageTag || 'en-US';

  const resolvedRealNow =
    realNow == null || realNow === '' ? null : new Date(realNow);

  const offsetMs =
    resolvedRealNow && !Number.isNaN(resolvedRealNow.getTime())
      ? resolvedRealNow.getTime() - Date.now()
      : 0;

  const now = (): Date => new Date(Date.now() + offsetMs);

  const toDate = (value?: DateInput): Date => {
    if (value == null || value === '') {
      return now();
    }

    if (typeof value === 'number') {
      return new Date(value);
    }

    if (isValidDate(value)) {
      return new Date(value);
    }

    return new Date(value);
  };

  return {
    offsetMs,

    now(): Date {
      return now();
    },

    local(value?: DateInput): Date {
      return toDate(value);
    },

    utc(value?: DateInput): string {
      return toDate(value).toISOString();
    },

    zone(value: DateInput, timeZone: string): Date {
      const date = toDate(value);
      const targetOffsetMs = getTimeZoneOffsetMs(timeZone, date);
      const localOffsetMs = getLocalOffsetMs(date);

      return new Date(date.getTime() + targetOffsetMs - localOffsetMs);
    },

    transform(value: DateInput, timeZone: string): Date {
      const date = toDate(value);

      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();
      const hour = date.getHours();
      const minute = date.getMinutes();
      const second = date.getSeconds();
      const ms = date.getMilliseconds();

      let utcMs = Date.UTC(year, month, day, hour, minute, second, ms);

      for (let i = 0; i < 2; i += 1) {
        const zoneOffsetMs = getTimeZoneOffsetMs(timeZone, new Date(utcMs));
        utcMs =
          Date.UTC(year, month, day, hour, minute, second, ms) - zoneOffsetMs;
      }

      return new Date(utcMs);
    },

    format(value: DateInput, options?: Intl.DateTimeFormatOptions): string {
      const date = toDate(value);

      const dateOptions = options ?? {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      };

      return new Intl.DateTimeFormat(locale, dateOptions).format(date);
    },

    formatParts(
      value: DateInput,
      options?: Intl.DateTimeFormatOptions
    ): FormattedDateParts {
      const date = toDate(value);

      const baseOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        ...options,
      };

      const locale = 'en-CA-u-ca-gregory-nu-latn';

      const parts = new Intl.DateTimeFormat(locale, baseOptions).formatToParts(
        date
      );

      const map: Record<string, string> = {};

      for (const part of parts) {
        if (part.type !== 'literal') {
          map[part.type] = part.value;
        }
      }

      return {
        year: map.year || '',
        month: map.month || '',
        day: map.day || '',
        hour: map.hour || '',
        minute: map.minute || '',
        second: map.second || '',
        formatted: new Intl.DateTimeFormat(locale, baseOptions).format(date),
        formattedDate: new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          timeZone: baseOptions.timeZone,
        }).format(date),
        formattedTime: new Intl.DateTimeFormat(locale, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: baseOptions.timeZone,
        }).format(date),
      };
    },

    compose(
      dateString: string,
      hours: string | number = 0,
      minutes: string | number = 0,
      seconds: string | number = 0
    ): Date {
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);

      if (!match) {
        return new Date(NaN);
      }

      const year = Number(match[1]);
      const monthIndex = Number(match[2]) - 1;
      const day = Number(match[3]);

      const h = Number(hours);
      const m = Number(minutes);
      const s = Number(seconds);

      return new Date(
        year,
        monthIndex,
        day,
        Number.isNaN(h) ? 0 : h,
        Number.isNaN(m) ? 0 : m,
        Number.isNaN(s) ? 0 : s,
        0
      );
    },

    relativeDateTimeLabel(value: DateInput): string {
      const date = toDate(value);

      if (!isValidDate(date)) {
        return '';
      }

      const currentDay = startOfDay(now());
      const targetDay = startOfDay(date);

      const diffDays = Math.round(
        (targetDay.getTime() - currentDay.getTime()) / DAY_MS
      );

      const time = new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(date);

      if (diffDays === 0) {
        return `${i18n.t('common.relativeDate.today')}, ${time}`;
      }

      if (diffDays === -1) {
        return `${i18n.t('common.relativeDate.yesterday')}, ${time}`;
      }

      const isCurrentYear = date.getFullYear() === now().getFullYear();

      const dateLabel = new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: 'short',
        ...(isCurrentYear ? {} : { year: 'numeric' }),
      }).format(date);

      return `${dateLabel}, ${time}`;
    },
  };
};
