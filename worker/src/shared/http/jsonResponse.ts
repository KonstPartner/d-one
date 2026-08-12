export const jsonError = <TCode extends string>(
  code: TCode,
  status: number,
): Response =>
  Response.json(
    {
      ok: false,
      error: {
        code,
      },
    },
    {
      status,
    },
  );

export const methodNotAllowed = (allowedMethods: readonly string[]): Response =>
  Response.json(
    {
      ok: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
      },
    },
    {
      status: 405,

      headers: {
        Allow: allowedMethods.join(', '),
      },
    },
  );
