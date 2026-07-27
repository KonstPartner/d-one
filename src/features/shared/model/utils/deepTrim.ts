export const deepTrim = <T>({
  data,
  maxLength = 255,
  leaveAll = false,
}: {
  data: T;
  maxLength?: number;
  leaveAll?: boolean;
}): T => {
  if (typeof data === 'string') {
    let result = data;
    if (!leaveAll) {
      result = result.replace(/\s+/g, ' ') as T & string;
    }

    return result.slice(0, maxLength) as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) =>
      deepTrim({ data: item, maxLength, leaveAll })
    ) as T;
  }

  if (data && typeof data === 'object') {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        deepTrim({ data: value, maxLength, leaveAll }),
      ])
    ) as T;
  }

  return data;
};
