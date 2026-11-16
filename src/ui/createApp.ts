import { createCountrySearch, type SearchState } from '../search/createCountrySearch';
import type { CountryView } from '../types/country';
import { createElement } from './dom';
import { renderCountryCard } from './renderCountryCard';
import { renderCountryDetails } from './renderCountryDetails';

export const createApp = (root: HTMLElement): void => {
  const title = createElement('h1', 'Поиск стран');
  const input = createElement('input', '', 'search-input');
  input.type = 'search';
  input.placeholder = 'Введите название страны';
  input.setAttribute('aria-label', 'Название страны');

  const message = createElement('div');
  const details = createElement('div');
  const list = createElement('ul', '', 'list');

  const showDetails = (country: CountryView): void => {
    details.replaceChildren(renderCountryDetails(country, () => details.replaceChildren()));
  };

  const renderMessage = (state: SearchState): void => {
    if (state.status === 'loading') {
      message.replaceChildren(createElement('p', 'Загрузка...', 'message loading'));
    } else if (state.status === 'empty') {
      message.replaceChildren(
        createElement('p', 'Ничего не найдено. Попробуйте другое название.', 'message empty'),
      );
    } else if (state.status === 'error') {
      const retryButton = createElement('button', 'Повторить', 'retry-button');
      retryButton.type = 'button';
      retryButton.addEventListener('click', () => search.retry());

      const error = createElement('div', '', 'message error');
      error.append(createElement('p', state.message), retryButton);
      message.replaceChildren(error);
    } else {
      message.replaceChildren();
    }
  };

  const render = (state: SearchState): void => {
    renderMessage(state);

    if (state.status === 'success') {
      list.replaceChildren(
        ...state.countries.map((country) => renderCountryCard(country, showDetails)),
      );
    } else {
      list.replaceChildren();
      details.replaceChildren();
    }
  };

  const search = createCountrySearch(render);

  input.addEventListener('input', () => search.handleInput(input.value));

  root.append(title, input, message, details, list);
};
