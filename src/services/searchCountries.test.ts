import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchCountries } from './searchCountries';
import { HttpError } from './HttpError';

describe('searchCountries', () => {
  const fetchMock = vi.fn();

  beforeEach(() => vi.stubGlobal('fetch', fetchMock));
  afterEach(() => {
    vi.resetAllMocks();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns an array of countries on HTTP 200', async () => {
    const fakeCountries = [{ name: 'Croatia' }];
    const signal = new AbortController().signal;

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(fakeCountries), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const result = await searchCountries('croatia', signal);

    expect(result).toEqual(fakeCountries);
  });

  it('returns an empty array on HTTP 404', async () => {
    const signal = new AbortController().signal;

    fetchMock.mockResolvedValue(
      new Response(null, {
        status: 404,
      }),
    );

    const result = await searchCountries('unknown', signal);

    expect(result).toEqual([]);
  });

  it('throws HttpError with status 500 on HTTP 500', async () => {
    const signal = new AbortController().signal;

    fetchMock.mockResolvedValue(
      new Response(null, {
        status: 500,
      }),
    );

    const promise = searchCountries('croatia', signal);

    await expect(promise).rejects.toThrow(HttpError);
    await expect(promise).rejects.toMatchObject({ status: 500 });
  });

  it('throws HttpError with status 503 on HTTP 503', async () => {
    const signal = new AbortController().signal;

    fetchMock.mockResolvedValue(
      new Response(null, {
        status: 503,
      }),
    );

    const promise = searchCountries('croatia', signal);

    await expect(promise).rejects.toThrow(HttpError);
    await expect(promise).rejects.toMatchObject({ status: 503 });
  });

  it('propagates network errors', async () => {
    const signal = new AbortController().signal;

    fetchMock.mockRejectedValue(new Error('Network Error'));

    await expect(searchCountries('croatia', signal)).rejects.toThrow('Network Error');
  });

  it('passes the url and AbortSignal to fetch', async () => {
    const signal = new AbortController().signal;

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await searchCountries('croatia', signal);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://countries.dev/name/croatia',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('encodes query parameters in the url', async () => {
    const signal = new AbortController().signal;

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await searchCountries('south korea', signal);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://countries.dev/name/south%20korea',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('passes a combined AbortSignal different from userSignal to fetch', async () => {
    const userSignal = new AbortController().signal;

    fetchMock.mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));

    await searchCountries('albania', userSignal);

    const receivedSignal = fetchMock.mock.calls[0][1].signal as AbortSignal;

    expect(receivedSignal).toBeInstanceOf(AbortSignal);
    expect(receivedSignal).not.toBe(userSignal);
  });

  it('aborts the combined signal when userController.abort() is called', async () => {
    const userController = new AbortController();

    fetchMock.mockImplementation(
      (_url: string, { signal }: { signal: AbortSignal }) =>
        new Promise((_, reject) => {
          signal.addEventListener('abort', () => reject(signal.reason), { once: true });
        }),
    );

    const promise = searchCountries('albania', userController.signal);

    const receivedSignal = fetchMock.mock.calls[0][1].signal as AbortSignal;

    expect(receivedSignal.aborted).toBe(false);

    userController.abort();

    expect(receivedSignal.aborted).toBe(true);

    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('aborts with TimeoutError when timeout expires', async () => {
    const userController = new AbortController();
    const timeoutController = new AbortController();

    vi.spyOn(AbortSignal, 'timeout').mockReturnValue(timeoutController.signal);

    fetchMock.mockImplementation(
      (_url: string, { signal }: { signal: AbortSignal }) =>
        new Promise((_, reject) => {
          signal.addEventListener('abort', () => reject(signal.reason), { once: true });
        }),
    );

    const promise = searchCountries('albania', userController.signal);

    const receivedSignal = fetchMock.mock.calls[0][1].signal as AbortSignal;

    expect(receivedSignal.aborted).toBe(false);

    timeoutController.abort(new DOMException('The operation timed out', 'TimeoutError'));

    expect(receivedSignal.aborted).toBe(true);
    expect(receivedSignal.reason).toBeInstanceOf(DOMException);
    expect(receivedSignal.reason.name).toBe('TimeoutError');

    await expect(promise).rejects.toMatchObject({
      name: 'TimeoutError',
    });
  });
});
