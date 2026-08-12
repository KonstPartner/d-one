import { withAppCheck } from './app/middleware/withAppCheck';

import { handleRequest } from './app/router';

export default {
  fetch: withAppCheck(handleRequest),
} satisfies ExportedHandler<Env>;
