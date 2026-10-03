import type { AppReleaseKind } from '../model/types';

type ParsedAppVersion = {
  major: number;
  minor: number;
  patch: number;
};

const VERSION_PATTERN = /^(\d+)\.(\d+)\.(\d+)$/;

const parseAppVersion = (version: string): ParsedAppVersion => {
  const match = VERSION_PATTERN.exec(version);

  if (match === null) {
    throw new Error(`Invalid app version: ${version}`);
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
};

export const getAppReleaseKind = (version: string): AppReleaseKind => {
  const parsedVersion = parseAppVersion(version);

  if (parsedVersion.patch > 0) {
    return 'patch';
  }

  if (parsedVersion.minor > 0) {
    return 'minor';
  }

  return 'major';
};

export const compareAppVersions = (left: string, right: string): number => {
  const leftVersion = parseAppVersion(left);
  const rightVersion = parseAppVersion(right);

  return (
    leftVersion.major - rightVersion.major ||
    leftVersion.minor - rightVersion.minor ||
    leftVersion.patch - rightVersion.patch
  );
};

export const getReleaseTranslationPrefix = (version: string): string =>
  `versionHistory.releases.${version.replaceAll('.', '_')}`;
