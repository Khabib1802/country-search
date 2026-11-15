import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchCountries } from './searchCountries';
import { HttpError } from './HttpError';

describe('searchCountries', () => {
  const fetchMock = vi.fn();

  beforeEach(() => vi.stubGlobal('fetch', fetchMock));
  afterEach(() => {
    vi.resetAllMocks();
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

    expect(fetchMock).toHaveBeenCalledWith('https://countries.dev/name/croatia', { signal });
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

    expect(fetchMock).toHaveBeenCalledWith('https://countries.dev/name/south%20korea', { signal });
  });
});
