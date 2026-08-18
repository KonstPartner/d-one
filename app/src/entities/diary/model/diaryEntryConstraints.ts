export const DIARY_ENTRY_METRIC_MAXIMUM = {
  glucose: 100,
  carbsGram: 1000,
  shortInsulin: 1000,
  ultraShortInsulin: 1000,
  longInsulin: 1000,
} as const;

export const DIARY_ENTRY_METRIC_STEP = {
  glucose: {
    press: 0.1,
    longPress: 1,
  },
  carbsGram: {
    press: 1,
    longPress: 5,
  },
  shortInsulin: {
    press: 0.5,
    longPress: 1,
  },
  ultraShortInsulin: {
    press: 0.5,
    longPress: 1,
  },
  longInsulin: {
    press: 0.5,
    longPress: 1,
  },
} as const;

export const DIARY_ENTRY_COMMENT_MAXIMUM_LENGTH = 5000;
