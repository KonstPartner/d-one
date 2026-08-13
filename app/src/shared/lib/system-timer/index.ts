import * as IntentLauncher from 'expo-intent-launcher';

import { PlatformOS } from '@shared/lib/platform';

type StartSystemTimerParams = {
  durationSeconds: number;
  message: string;
};

const ACTION_SET_TIMER = 'android.intent.action.SET_TIMER';

const EXTRA_LENGTH = 'android.intent.extra.alarm.LENGTH';
const EXTRA_MESSAGE = 'android.intent.extra.alarm.MESSAGE';
const EXTRA_SKIP_UI = 'android.intent.extra.alarm.SKIP_UI';

const MINIMUM_TIMER_DURATION_SECONDS = 1;
const MAXIMUM_TIMER_DURATION_SECONDS = 24 * 60 * 60;

export const startSystemTimer = async ({
  durationSeconds,
  message,
}: StartSystemTimerParams): Promise<void> => {
  if (
    !PlatformOS.ANDROID ||
    !Number.isInteger(durationSeconds) ||
    durationSeconds < MINIMUM_TIMER_DURATION_SECONDS ||
    durationSeconds > MAXIMUM_TIMER_DURATION_SECONDS
  ) {
    throw new Error('System timer is unavailable');
  }

  await IntentLauncher.startActivityAsync(ACTION_SET_TIMER, {
    extra: {
      [EXTRA_LENGTH]: durationSeconds,
      [EXTRA_MESSAGE]: message,
      [EXTRA_SKIP_UI]: true,
    },
  });
};
