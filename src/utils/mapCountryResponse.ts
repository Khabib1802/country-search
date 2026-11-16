import type { CountryView, CurrencyView, FlagsView, LanguageView } from '../types/country';

type RecordValue = Record<string, unknown>;

const isRecord = (value: unknown): value is RecordValue =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasOwn = (object: RecordValue, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(object, key);

const getOptionalString = (object: RecordValue, key: string): string | undefined => {
  if (!hasOwn(object, key)) return undefined;

  const value = object[key];

  if (typeof value !== 'string') {
    throw new TypeError(`Invalid "${key}" field`);
  }

  return value;
};

const getOptionalNumber = (object: RecordValue, key: string): number | undefined => {
  if (!hasOwn(object, key)) return undefined;

  const value = object[key];

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`Invalid "${key}" field`);
  }

  return value;
};

const getStringArray = (object: RecordValue, key: string): string[] => {
  if (!hasOwn(object, key)) return [];

  const value = object[key];

  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new TypeError(`Invalid "${key}" field`);
  }

  return value;
};

const mapCurrencies = (value: unknown): CurrencyView[] => {
  if (!Array.isArray(value)) {
    throw new TypeError('Invalid "currencies" field');
  }

  return value.map((currency) => {
    if (!isRecord(currency)) {
      throw new TypeError('Invalid currency');
    }

    const code = getOptionalString(currency, 'code');
    const name = getOptionalString(currency, 'name');
    const symbol = getOptionalString(currency, 'symbol');

    return {
      ...(code !== undefined && { code }),
      ...(name !== undefined && { name }),
      ...(symbol !== undefined && { symbol }),
    };
  });
};

const mapLanguages: (value: unknown) => LanguageView[] = (value) => {
  if (!Array.isArray(value)) {
    throw new TypeError('Invalid "languages" field');
  }

  return value.flatMap((language) => {
    if (!isRecord(language)) {
      throw new TypeError('Invalid language');
    }

    const name = language.name;

    if (name === undefined || name === null || name === '') {
      return [];
    }

    if (typeof name !== 'string') {
      throw new TypeError('Invalid language name');
    }

    if (name.trim() === '') return [];

    return [{ name }];
  });
};

const mapFlags = (value: unknown): FlagsView => {
  if (!isRecord(value)) {
    throw new TypeError('Invalid "flags" field');
  }

  const svg = getOptionalString(value, 'svg');
  const png = getOptionalString(value, 'png');

  return {
    ...(svg !== undefined && { svg }),
    ...(png !== undefined && { png }),
  };
};

const mapCountry = (value: unknown): CountryView => {
  if (!isRecord(value)) {
    throw new TypeError('Invalid country');
  }

  const { name, alpha2Code, region } = value;

  if (
    typeof name !== 'string' ||
    name.trim() === '' ||
    typeof alpha2Code !== 'string' ||
    alpha2Code.trim() === '' ||
    typeof region !== 'string' ||
    region.trim() === ''
  ) {
    throw new TypeError('Invalid required country fields');
  }

  return {
    name,
    alpha2Code,
    region,
    capital: getOptionalString(value, 'capital'),
    population: getOptionalNumber(value, 'population'),
    area: getOptionalNumber(value, 'area'),
    borders: getStringArray(value, 'borders'),
    currencies: hasOwn(value, 'currencies') ? mapCurrencies(value.currencies) : [],
    languages: hasOwn(value, 'languages') ? mapLanguages(value.languages) : [],
    flags: hasOwn(value, 'flags') ? mapFlags(value.flags) : undefined,
  };
};

export const mapCountryResponse = (raw: unknown): CountryView[] => {
  if (!Array.isArray(raw)) throw new Error('Country response must be an array');

  return raw.map(mapCountry);
};
