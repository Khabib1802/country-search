import type { CountryView } from '../types/country';
import { createElement, formatNumber, formatText } from './dom';

export const renderCountryCard = (
  country: CountryView,
  onSelect: (country: CountryView) => void,
): HTMLElement => {
  const card = createElement('li', '', 'card');
  const button = createElement('button', '', 'card-button');
  button.type = 'button';
  button.addEventListener('click', () => onSelect(country));

  const flagUrl = country.flags?.svg ?? country.flags?.png;
  if (flagUrl) {
    const flag = createElement('img', '', 'flag');
    flag.src = flagUrl;
    flag.alt = `Флаг: ${country.name}`;
    button.append(flag);
  }

  const info = createElement('div');
  info.append(
    createElement('h2', country.name),
    createElement('p', `Столица: ${formatText(country.capital)}`),
    createElement('p', `Регион: ${country.region}`),
    createElement('p', `Население: ${formatNumber(country.population)}`),
  );

  button.append(info);
  card.append(button);

  return card;
};
