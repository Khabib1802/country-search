import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createCountrySearch, DEBOUNCE_DELAY, type SearchState } from './createCountrySearch';

interface PendingRequest {
  url: string;
  signal: AbortSignal;
  respond: (status: number, body?: unknown) => void;
}

const spain = { name: 'Spain', alpha2Code: 'ES', region: 'Europe' };
const spanishVirginIslands = { name: 'Spanish Islands', alpha2Code: 'XX', region: 'Americas' };

describe('country search: race of stale responses', () => {
  let pending: PendingRequest[];
  let states: SearchState[];

  const lastState = (): SearchState => states[states.length - 1];

  const fakeFetch = (url: string, { signal }: { signal: AbortSignal }) =>
    new Promise<Response>((resolve, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason), { once: true });

      pending.push({
        url,
        signal,
        respond: (status, body = []) => resolve(new Response(JSON.stringify(body), { status })),
      });
    });

  beforeEach(() => {
    vi.useFakeTimers();
    pending = [];
    states = [];
    vi.stubGlobal('fetch', vi.fn(fakeFetch));
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('shows only the result of the last query when the old response is slower', async () => {
    const search = createCountrySearch((state) => states.push(state));

    search.handleInput('sp');
    vi.advanceTimersByTime(DEBOUNCE_DELAY);

    search.handleInput('spain');
    vi.advanceTimersByTime(DEBOUNCE_DELAY);

    expect(pending).toHaveLength(2);

    pending[1].respond(200, [spain]);
    pending[0].respond(200, [spanishVirginIslands]);

    await vi.waitFor(() => expect(lastState().status).toBe('success'));

    expect(lastState()).toMatchObject({ countries: [{ name: 'Spain' }] });
    expect(JSON.stringify(states)).not.toContain('Spanish Islands');
  });

  it('aborts the previous request on every input, even before debounce fires', () => {
    const search = createCountrySearch((state) => states.push(state));

    search.handleInput('sp');
    vi.advanceTimersByTime(DEBOUNCE_DELAY);

    expect(pending[0].signal.aborted).toBe(false);

    search.handleInput('spa');

    expect(pending[0].signal.aborted).toBe(true);
    expect(pending).toHaveLength(1);
  });

  it('does not show own abort as an error', async () => {
    const search = createCountrySearch((state) => states.push(state));

    search.handleInput('sp');
    vi.advanceTimersByTime(DEBOUNCE_DELAY);
    search.handleInput('');

    await vi.advanceTimersByTimeAsync(DEBOUNCE_DELAY);

    expect(states.some((state) => state.status === 'error')).toBe(false);
    expect(lastState()).toEqual({ status: 'idle' });
  });

  it('shows empty state on 404', async () => {
    const search = createCountrySearch((state) => states.push(state));

    search.handleInput('qwerty');
    vi.advanceTimersByTime(DEBOUNCE_DELAY);
    pending[0].respond(404);

    await vi.waitFor(() => expect(lastState().status).toBe('empty'));
  });

  it('shows error on 500 and retry repeats the last query', async () => {
    const search = createCountrySearch((state) => states.push(state));

    search.handleInput('spain');
    vi.advanceTimersByTime(DEBOUNCE_DELAY);
    pending[0].respond(500);

    await vi.waitFor(() => expect(lastState().status).toBe('error'));

    search.retry();

    expect(pending).toHaveLength(2);
    expect(pending[1].url).toBe(pending[0].url);

    pending[1].respond(200, [spain]);

    await vi.waitFor(() => expect(lastState().status).toBe('success'));
  });
});
