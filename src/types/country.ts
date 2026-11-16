export interface CountryView {
  name: string;
  alpha2Code: string;
  capital: string | undefined;
  region: string;
  population: number | undefined;
  area: number | undefined;
  borders: string[];
  currencies: CurrencyView[];
  languages: LanguageView[];
  flags: FlagsView | undefined;
}

export interface CurrencyView {
  code?: string;
  name?: string;
  symbol?: string;
}

export interface LanguageView {
  name: string;
}

export interface FlagsView {
  /**
   * @format `uri`
   */
  svg?: string;

  /**
   * @format `uri`
   */
  png?: string;
}
