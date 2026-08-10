type DeepTrimOptions<T> = {
  data: T;
  maxLength?: number;
  preserveWhitespace?: boolean;
};

export const deepTrim = <T>({
  data,
  maxLength = 255,
  preserveWhitespace = false,
}: DeepTrimOptions<T>): T => {
  if (typeof data === 'string') {
    const normalized = preserveWhitespace ? data : data.replace(/\s+/g, ' ');

    return normalized.slice(0, maxLength) as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) =>
      deepTrim({
        data: item,
        maxLength,
        preserveWhitespace,
      })
    ) as T;
  }

  if (data !== null && typeof data === 'object') {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        deepTrim({
          data: value,
          maxLength,
          preserveWhitespace,
        }),
      ])
    ) as T;
  }

  return data;
};
