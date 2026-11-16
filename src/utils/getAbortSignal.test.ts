import { describe, it, expect } from 'vitest';
import { getAbortSignal } from './getAbortSignal';

describe('getAbortSignal', () => {
  it('', () => {
    expect(getAbortSignal()).toBeInstanceOf(AbortSignal);
  });

  it('', () => {
    const signal1 = getAbortSignal();
    getAbortSignal();
    expect(signal1.aborted).toBe(true);
  });

  it('', () => {
    getAbortSignal();
    const signal2 = getAbortSignal();
    expect(signal2.aborted).toBe(false);
  });
});
