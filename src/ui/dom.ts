export const createElement = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  text = '',
  className = '',
): HTMLElementTagNameMap[K] => {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;

  return element;
};

export const formatNumber = (value: number | undefined): string => {
  if (value === undefined) return '—';

  return value.toLocaleString('ru-RU');
};

export const formatText = (value: string | undefined): string => value ?? '—';
