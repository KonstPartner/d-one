const SESSION_MUTATION_ROOT = ['session', 'mutation'] as const;

export const sessionMutationKeys = {
  root: SESSION_MUTATION_ROOT,

  operation: (operation: string) =>
    [...SESSION_MUTATION_ROOT, operation] as const,
};
