import { describe, it, expect } from 'vitest';
import { getAbortSignal } from './getAbortSignal';

describe('getAbortSignal', () => {
  it('returns an AbortSignal instance', () => {
    expect(getAbortSignal()).toBeInstanceOf(AbortSignal);
  });

  it('aborts the previous signal when called again', () => {
    const signal1 = getAbortSignal();
    getAbortSignal();
    expect(signal1.aborted).toBe(true);
  });

  it('returns a new non-aborted signal on subsequent calls', () => {
    getAbortSignal();
    const signal2 = getAbortSignal();
    expect(signal2.aborted).toBe(false);
  });
});
