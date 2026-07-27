import { useEffect, useState } from 'react';

const useDebouncedValue = <T>(value: T, delayMs: number) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);

    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
};

export default useDebouncedValue;
