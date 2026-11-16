import { searchCountries } from '../services/searchCountries';
import type { CountryView } from '../types/country';
import { debounce } from '../utils/debounce';
import { getAbortSignal } from '../utils/getAbortSignal';
import { getErrorType } from '../utils/getErrorType';
import { mapCountryResponse } from '../utils/mapCountryResponse';

export const DEBOUNCE_DELAY = 400;

export type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; countries: CountryView[] }
  | { status: 'empty' }
  | { status: 'error'; message: string };

const getErrorMessage = (error: unknown): string => {
  if (getErrorType(error) === 'timeout') return 'Сервер слишком долго отвечает';

  return 'Не удалось выполнить поиск';
};

export const createCountrySearch = (onChange: (state: SearchState) => void) => {
  let lastQuery = '';

  const runSearch = async (query: string, signal: AbortSignal): Promise<void> => {
    try {
      const raw = await searchCountries(query, signal);
      const countries = mapCountryResponse(raw);

      if (countries.length === 0) {
        onChange({ status: 'empty' });
      } else {
        onChange({ status: 'success', countries });
      }
    } catch (error) {
      if (getErrorType(error) === 'abort') return;

      onChange({ status: 'error', message: getErrorMessage(error) });
    }
  };

  const debouncedSearch = debounce(runSearch, DEBOUNCE_DELAY);

  const handleInput = (text: string): void => {
    const query = text.trim();
    lastQuery = query;

    const signal = getAbortSignal();
    debouncedSearch.cancel();

    if (query === '') {
      onChange({ status: 'idle' });
      return;
    }

    onChange({ status: 'loading' });
    debouncedSearch(query, signal);
  };

  const retry = (): void => {
    if (lastQuery === '') return;

    onChange({ status: 'loading' });
    void runSearch(lastQuery, getAbortSignal());
  };

  return { handleInput, retry };
};
