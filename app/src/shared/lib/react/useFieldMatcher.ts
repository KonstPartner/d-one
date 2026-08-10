import { useMemo } from 'react';

const useFieldMatcher = <
  T extends Record<string, string>,
  K extends T[keyof T] | undefined,
>(
  object: T,
  value?: K
) => {
  return useMemo(
    () =>
      (Object.keys(object) as Array<keyof T>).reduce(
        (acc, key) => {
          const enumKey = key as keyof T;
          acc[enumKey] = object[enumKey] === value;

          return acc;
        },
        {} as { [K in keyof T]: boolean }
      ),
    [object, value]
  );
};

export default useFieldMatcher;
