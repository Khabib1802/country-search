import { HttpError } from './HttpError';

export const searchCountries = async (query: string, signal: AbortSignal): Promise<unknown> => {
  const encodedQuery = encodeURIComponent(query);
  const response = await fetch(`https://countries.dev/name/${encodedQuery}`, { signal });

  if (response.status === 404) return [];
  if (!response.ok) throw new HttpError(response.status);

  return response.json();
};
