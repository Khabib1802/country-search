import { HttpError } from './HttpError';

export const searchCountries = async (query: string, signal: AbortSignal): Promise<unknown> => {
  const encodedQuery = encodeURIComponent(query);

  const combinedSignal = AbortSignal.any([signal, AbortSignal.timeout(5000)]);

  const response = await fetch(`https://countries.dev/name/${encodedQuery}`, {
    signal: combinedSignal,
  });

  if (response.status === 404) return [];
  if (!response.ok) throw new HttpError(response.status);

  return response.json();
};
