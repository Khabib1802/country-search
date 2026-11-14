export function debounce<T extends (...args: never[]) => unknown>(): (
  ...args: Parameters<T>
) => void {
  throw new Error('Not Implemented');
}
