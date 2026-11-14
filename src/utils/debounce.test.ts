import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from './debounce';

describe('debounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should call callback after the specified delay', () => {
    const callback = vi.fn();
    const debouncedCallback = debounce(callback, 500);

    debouncedCallback();

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);

    expect(callback).toHaveBeenCalledOnce();
  });

  it('should reset the timer when called again before the delay expires', () => {
    const callback = vi.fn();
    const debouncedCallback = debounce(callback, 500);

    debouncedCallback();

    vi.advanceTimersByTime(300);
    debouncedCallback();

    vi.advanceTimersByTime(300);

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);

    expect(callback).toHaveBeenCalledOnce();
  });

  it('should call callback only once after multiple calls', () => {
    const callback = vi.fn();
    const debouncedCallback = debounce(callback, 500);

    debouncedCallback();
    vi.advanceTimersByTime(100);

    debouncedCallback();
    vi.advanceTimersByTime(100);

    debouncedCallback();

    vi.advanceTimersByTime(500);

    expect(callback).toHaveBeenCalledOnce();
  });

  it('should pass the latest arguments to callback', () => {
    const callback = vi.fn();
    const debouncedCallback = debounce(callback, 500);

    debouncedCallback('spa');
    debouncedCallback('spai');
    debouncedCallback('spain');

    vi.advanceTimersByTime(500);

    expect(callback).toHaveBeenCalledWith('spain');
  });

  it('should preserve callback arguments types', () => {
    const callback = vi.fn((query: string, limit: number) => {
      return `${query}-${limit}`;
    });

    const debouncedCallback = debounce(callback, 500);

    debouncedCallback('spain', 10);

    vi.advanceTimersByTime(500);

    expect(callback).toHaveBeenCalledWith('spain', 10);
  });
});
