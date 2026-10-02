import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '../../shared/http/apiError';

const repository = vi.hoisted(() => ({
  ensureUsageRows: vi.fn(),
  tryReserveUserUsage: vi.fn(),
  getUserUsageSnapshot: vi.fn(),
  tryReserveProjectUsage: vi.fn(),
  commitUserUsage: vi.fn(),
  compensateProjectUsage: vi.fn(),
  releaseUserLease: vi.fn(),
}));

vi.mock('./aiUsageRepository', () => ({
  createAiUsageKeys: () => ({
    userUsageKey: 'user:user-1:2026-10-02',
    previousUserUsageKey: 'user:user-1:2026-10-01',
    projectUsageKey: 'project:2026-10-02',
  }),

  ...repository,
}));

import {
  commitAiUsage,
  reserveAiUsage,
  type AiUsageReservation,
} from './aiUsage';

const db = {} as D1Database;

const reservation: AiUsageReservation = {
  userUsageKey: 'user:user-1:2026-10-02',
  projectUsageKey: 'project:2026-10-02',
  activeUntil: 1_790_960_550,
};

describe('AI usage accounting', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    repository.ensureUsageRows.mockResolvedValue(undefined);
    repository.tryReserveUserUsage.mockResolvedValue(true);
    repository.tryReserveProjectUsage.mockResolvedValue(true);
    repository.commitUserUsage.mockResolvedValue(true);
    repository.compensateProjectUsage.mockResolvedValue(undefined);
    repository.releaseUserLease.mockResolvedValue(undefined);
  });

  it('reserves only the user lease without consuming a daily attempt', async () => {
    const result = await reserveAiUsage({
      db,
      uid: 'user-1',
      now: new Date('2026-10-02T17:00:00.000Z'),
    });

    expect(result).toEqual({
      userUsageKey: 'user:user-1:2026-10-02',
      projectUsageKey: 'project:2026-10-02',
      activeUntil: 1_790_960_550,
    });

    expect(repository.tryReserveUserUsage).toHaveBeenCalledTimes(1);
    expect(repository.tryReserveProjectUsage).not.toHaveBeenCalled();
    expect(repository.commitUserUsage).not.toHaveBeenCalled();
  });

  it('consumes user and project usage only when the request is committed', async () => {
    await commitAiUsage({
      db,
      reservation,
      projectDailyLimit: 1_000,
      now: new Date('2026-10-02T17:00:00.000Z'),
    });

    expect(repository.tryReserveProjectUsage).toHaveBeenCalledWith(
      db,
      reservation.projectUsageKey,
      1_000,
    );

    expect(repository.commitUserUsage).toHaveBeenCalledWith({
      db,
      userUsageKey: reservation.userUsageKey,
      activeUntil: reservation.activeUntil,
      userDailyLimit: 15,
      committedAt: 1_790_960_400,
    });

    expect(repository.compensateProjectUsage).not.toHaveBeenCalled();
  });

  it('does not consume user usage when the project daily limit is reached', async () => {
    repository.tryReserveProjectUsage.mockResolvedValueOnce(false);

    await expect(
      commitAiUsage({
        db,
        reservation,
        projectDailyLimit: 1_000,
      }),
    ).rejects.toMatchObject({
      code: 'PROJECT_DAILY_LIMIT_REACHED',
    });

    expect(repository.commitUserUsage).not.toHaveBeenCalled();
    expect(repository.compensateProjectUsage).not.toHaveBeenCalled();
  });

  it('rolls back the project count when the user commit fails', async () => {
    repository.commitUserUsage.mockResolvedValueOnce(false);

    await expect(
      commitAiUsage({
        db,
        reservation,
        projectDailyLimit: 1_000,
      }),
    ).rejects.toThrow('AI_USAGE_COMMIT_FAILED');

    expect(repository.compensateProjectUsage).toHaveBeenCalledWith(
      db,
      reservation.projectUsageKey,
    );
  });
});
