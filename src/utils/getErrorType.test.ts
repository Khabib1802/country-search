import { describe, it, expect } from 'vitest';
import { getErrorType } from './getErrorType';

describe('getErrorType', () => {
  it('should return "abort" for an AbortError DOMException', () => {
    const error = new DOMException('Request aborted', 'AbortError');

    expect(getErrorType(error)).toBe('abort');
  });

  it('should return "timeout" for a TimeoutError DOMException', () => {
    const error = new DOMException('Request timed out', 'TimeoutError');

    expect(getErrorType(error)).toBe('timeout');
  });

  it('should return "unknown" for a DOMException with an unknown name', () => {
    const error = new DOMException('Invalid state', 'InvalidStateError');

    expect(getErrorType(error)).toBe('unknown');
  });

  it('should return "unknown" for a generic Error instance', () => {
    const error = new Error('Something went wrong');

    expect(getErrorType(error)).toBe('unknown');
  });

  it.each([
    ['string', 'Something went wrong'],
    ['null', null],
    ['undefined', undefined],
    ['number', 123],
    ['plain object', { name: 'AbortError' }],
  ])('should return "unknown" for a non-DOMException value (%s)', (_, error) => {
    expect(getErrorType(error)).toBe('unknown');
  });
});
