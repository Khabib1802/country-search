import type { CountryView } from '../types/country';
import { createElement, formatNumber } from './dom';

const getCurrencyText = (country: CountryView): string => {
  if (country.currencies.length === 0) return '—';

  return country.currencies
    .map((currency) => [currency.name, currency.code].filter(Boolean).join(' '))
    .join(', ');
};

export const renderCountryDetails = (country: CountryView, onClose: () => void): HTMLElement => {
  const details = createElement('section', '', 'details');

  const closeButton = createElement('button', 'Закрыть', 'close-button');
  closeButton.type = 'button';
  closeButton.addEventListener('click', onClose);

  const description = `${country.name} — страна в регионе ${country.region}. Код страны: ${country.alpha2Code}.`;
  const languages = country.languages.map((language) => language.name).join(', ') || '—';
  const borders = country.borders.join(', ') || 'нет';

  details.append(
    createElement('h2', country.name),
    createElement('p', description),
    createElement('p', `Площадь: ${formatNumber(country.area)} км²`),
    createElement('p', `Границы: ${borders}`),
    createElement('p', `Языки: ${languages}`),
    createElement('p', `Валюта: ${getCurrencyText(country)}`),
    closeButton,
  );

  return details;
};
