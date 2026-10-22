import type { AppRelease } from './types';

export const APP_RELEASES = [
  {
    version: '1.1.0',
    releasedAt: '2026-10-03',
    changes: [
      {
        key: 'aiAnalysis',
        icon: 'ai',
      },
      {
        key: 'inputs',
        icon: 'input',
      },
      {
        key: 'photoEditor',
        icon: 'photo',
      },
      {
        key: 'errorMessages',
        icon: 'errors',
      },
    ],
  },
  {
    version: '1.0.0',
    releasedAt: '2026-08-18',
    changes: [
      {
        key: 'diary',
        icon: 'diary',
      },
      {
        key: 'aiAnalysis',
        icon: 'ai',
      },
      {
        key: 'subscriptions',
        icon: 'subscriptions',
      },
      {
        key: 'sync',
        icon: 'sync',
      },
      {
        key: 'backup',
        icon: 'backup',
      },
      {
        key: 'timer',
        icon: 'timer',
      },
    ],
  },
] as const satisfies readonly AppRelease[];

const CURRENT_APP_RELEASE = APP_RELEASES[0];

export const CURRENT_APP_VERSION = CURRENT_APP_RELEASE.version;
