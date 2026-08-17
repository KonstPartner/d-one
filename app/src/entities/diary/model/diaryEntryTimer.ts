const DIARY_ENTRY_TIMER_OFFSET_MS = 2 * 60 * 60 * 1000;

const getDiaryEntryTimerTargetAt = (eventAt: Date): Date =>
  new Date(eventAt.getTime() + DIARY_ENTRY_TIMER_OFFSET_MS);

export const getDiaryEntryTimerDurationSeconds = (
  eventAt: Date,
  now: Date = new Date()
): number =>
  Math.ceil(
    (getDiaryEntryTimerTargetAt(eventAt).getTime() - now.getTime()) / 1000
  );

export const canCreateDiaryEntryTimer = (
  eventAt: Date,
  now: Date = new Date()
): boolean => getDiaryEntryTimerDurationSeconds(eventAt, now) > 0;
