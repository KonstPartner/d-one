import { i18n } from '@features/i18n/model';

import { errorMapper } from '../error';

jest.mock('@features/i18n/model', () => ({
  i18n: {
    t: jest.fn((key: string) => `t:${key}`),
  },
}));

describe('errorMapper', () => {
  const tMock = i18n.t as unknown as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns translated firebase error for array match (wrongEmailOrPassword)', () => {
    const error = new Error('Firebase: auth/user-not-found');

    const res = errorMapper(error, 'firebase');

    expect(res).toBe('t:common.errors.wrongEmailOrPassword');
    expect(tMock).toHaveBeenCalledWith('common.errors.wrongEmailOrPassword');
  });

  it('returns translated firebase error for string match (emailAlreadyExists)', () => {
    const error = new Error('Something: email-already-in-use');

    const res = errorMapper(error, 'firebase');

    expect(res).toBe('t:common.errors.emailAlreadyExists');
    expect(tMock).toHaveBeenCalledWith('common.errors.emailAlreadyExists');
  });

  it('returns translated firebase error for tooManyRequests', () => {
    const error = new Error('auth/too-many-requests');

    const res = errorMapper(error, 'firebase');

    expect(res).toBe('t:common.errors.tooManyRequests');
    expect(tMock).toHaveBeenCalledWith('common.errors.tooManyRequests');
  });

  it('returns original error.message when type is none and no mapping exists', () => {
    const error = new Error('Some random error');

    const res = errorMapper(error, 'none');

    expect(res).toBe('Some random error');
    expect(tMock).not.toHaveBeenCalled();
  });

  it('returns original error.message when mapping does not match (firebase)', () => {
    const error = new Error('Totally unknown firebase error');

    const res = errorMapper(error, 'firebase');

    expect(res).toBe('Totally unknown firebase error');
    expect(tMock).not.toHaveBeenCalled();
  });

  it('returns translated unknown error when input is not an Error', () => {
    const res = errorMapper({ message: 'not an Error instance' }, 'firebase');

    expect(res).toBe('t:common.errors.unknown');
    expect(tMock).toHaveBeenCalledWith('common.errors.unknown');
  });

  it('does not throw on null/undefined and returns unknown translation', () => {
    expect(errorMapper(null, 'api')).toBe('t:common.errors.unknown');
    expect(errorMapper(undefined, 'api')).toBe('t:common.errors.unknown');
    expect(tMock).toHaveBeenCalledWith('common.errors.unknown');
  });
});
