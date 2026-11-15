import { describe, it, expect } from 'vitest';
import { mapCountryResponse } from './mapCountryResponse';

describe('mapCountryResponse', () => {
  describe('valid data', () => {
    it('maps an array of countries to CountryView[]', () => {
      const raw = [
        {
          name: 'Japan',
          alpha2Code: 'JP',
          region: 'Asia',
          capital: 'Tokyo',
          population: 125000000,
          area: 377975,
          borders: [],
          currencies: [{ code: 'JPY', name: 'Japanese yen', symbol: '¥' }],
          languages: [{ name: 'Japanese' }],
          flags: { svg: 'japan.svg', png: 'japan.png' },
        },
        {
          name: 'Germany',
          alpha2Code: 'DE',
          region: 'Europe',
          capital: 'Berlin',
          population: 83000000,
          area: 357022,
          borders: ['AUT', 'BEL'],
          currencies: [{ code: 'EUR', name: 'Euro', symbol: '€' }],
          languages: [{ name: 'German' }],
          flags: { svg: 'germany.svg' },
        },
      ];

      expect(mapCountryResponse(raw)).toEqual([
        {
          name: 'Japan',
          alpha2Code: 'JP',
          region: 'Asia',
          capital: 'Tokyo',
          population: 125000000,
          area: 377975,
          borders: [],
          currencies: [{ code: 'JPY', name: 'Japanese yen', symbol: '¥' }],
          languages: [{ name: 'Japanese' }],
          flags: { svg: 'japan.svg', png: 'japan.png' },
        },
        {
          name: 'Germany',
          alpha2Code: 'DE',
          region: 'Europe',
          capital: 'Berlin',
          population: 83000000,
          area: 357022,
          borders: ['AUT', 'BEL'],
          currencies: [{ code: 'EUR', name: 'Euro', symbol: '€' }],
          languages: [{ name: 'German' }],
          flags: { svg: 'germany.svg' },
        },
      ]);
    });

    it('returns an empty array when input is empty', () => {
      expect(mapCountryResponse([])).toEqual([]);
    });

    it('ignores unknown fields', () => {
      const raw = [
        {
          name: 'Japan',
          alpha2Code: 'JP',
          region: 'Asia',
          extraField: '123',
        },
      ];

      const result = mapCountryResponse(raw);

      expect(result[0]).not.toHaveProperty('extraField');
    });
  });

  describe('optional fields', () => {
    it('uses default values when optional fields are absent', () => {
      const raw = [
        {
          name: 'Japan',
          alpha2Code: 'JP',
          region: 'Asia',
        },
      ];

      expect(mapCountryResponse(raw)).toEqual([
        {
          name: 'Japan',
          alpha2Code: 'JP',
          region: 'Asia',
          capital: undefined,
          population: undefined,
          area: undefined,
          borders: [],
          currencies: [],
          languages: [],
          flags: undefined,
        },
      ]);
    });

    it('filters languages without a valid name', () => {
      const raw = [
        {
          name: 'Belgium',
          alpha2Code: 'BE',
          region: 'Europe',
          languages: [
            { name: 'Dutch' },
            {},
            { name: undefined },
            { name: null },
            { name: '' },
            { name: 'French' },
          ],
        },
      ];

      expect(mapCountryResponse(raw)[0].languages).toEqual([{ name: 'Dutch' }, { name: 'French' }]);
    });

    it('returns an empty languages array when all languages have no name', () => {
      const raw = [
        {
          name: 'Belgium',
          alpha2Code: 'BE',
          region: 'Europe',
          languages: [{}, { name: undefined }, { name: '' }],
        },
      ];

      expect(mapCountryResponse(raw)[0].languages).toEqual([]);
    });
  });

  describe('invalid top-level structure', () => {
    it.each(['some string', 123, true, undefined, null, { message: 'Not found' }, { data: [] }])(
      'throws an error for invalid input: %s',
      (raw) => {
        expect(() => mapCountryResponse(raw)).toThrow(Error);
      },
    );
  });

  describe('invalid country elements', () => {
    it.each([null, 'Ukraine', 123, undefined])(
      'throws an error when an element is not an object',
      (country) => {
        expect(() => mapCountryResponse([country])).toThrow(Error);
      },
    );

    it.each([
      { alpha2Code: 'JP', region: 'Asia' },
      { name: undefined, alpha2Code: 'JP', region: 'Asia' },
      { name: 12345, alpha2Code: 'JP', region: 'Asia' },
      { name: null, alpha2Code: 'JP', region: 'Asia' },
      { name: {}, alpha2Code: 'JP', region: 'Asia' },
      { name: 'Japan', region: 'Asia' },
      { name: 'Japan', alpha2Code: 123, region: 'Asia' },
      { name: 'Japan', alpha2Code: 'JP', region: 123 },
    ])('throws an error for invalid required fields', (country) => {
      expect(() => mapCountryResponse([country])).toThrow(Error);
    });

    it('throws an error if at least one country is invalid', () => {
      const raw = [
        {
          name: 'Japan',
          alpha2Code: 'JP',
          region: 'Asia',
        },
        {
          alpha2Code: 'DE',
          region: 'Europe',
        },
      ];

      expect(() => mapCountryResponse(raw)).toThrow(Error);
    });
  });

  describe('invalid nested structures', () => {
    it.each(['English', 123, {}])(
      'throws an error when languages is not an array: %s',
      (languages) => {
        const raw = [
          {
            name: 'Japan',
            alpha2Code: 'JP',
            region: 'Asia',
            languages,
          },
        ];

        expect(() => mapCountryResponse(raw)).toThrow(Error);
      },
    );

    it.each([null, 'English', 123])(
      'throws an error when a language element is not an object',
      (language) => {
        const raw = [
          {
            name: 'Japan',
            alpha2Code: 'JP',
            region: 'Asia',
            languages: [language],
          },
        ];

        expect(() => mapCountryResponse(raw)).toThrow(Error);
      },
    );
  });

  describe('invalid optional fields', () => {
    it.each([
      { capital: null },
      { capital: 123 },
      { population: '125000000' },
      { area: '377975' },
      { borders: null },
      { borders: 'DE' },
      { currencies: 'EUR' },
      { currencies: 123 },
      { flags: null },
      { flags: 'japan.svg' },
    ])('throws an error for invalid optional field values', (fields) => {
      const raw = [
        {
          name: 'Japan',
          alpha2Code: 'JP',
          region: 'Asia',
          ...fields,
        },
      ];

      expect(() => mapCountryResponse(raw)).toThrow(Error);
    });
  });
});
