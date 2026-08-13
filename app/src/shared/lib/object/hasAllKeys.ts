export const hasAllKeys = <T extends object>(
  obj: unknown,
  keys: (keyof T)[]
): obj is T => {
  return typeof obj === 'object' && obj !== null && keys.every((k) => k in obj);
};
