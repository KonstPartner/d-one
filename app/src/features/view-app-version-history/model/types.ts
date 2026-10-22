export type AppReleaseKind = 'major' | 'minor' | 'patch';

export type AppReleaseChangeIcon =
  | 'ai'
  | 'backup'
  | 'diary'
  | 'errors'
  | 'input'
  | 'photo'
  | 'subscriptions'
  | 'sync'
  | 'timer';

type AppReleaseChange = {
  key: string;
  icon: AppReleaseChangeIcon;
};

export type AppRelease = {
  version: string;
  releasedAt: string;
  changes: readonly AppReleaseChange[];
};
