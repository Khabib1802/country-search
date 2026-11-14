export function debounce<T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timerId: ReturnType<typeof setTimeout> | undefined;

  return (...args: Parameters<T>): void => {
    if (timerId !== undefined) clearTimeout(timerId);
    timerId = setTimeout(() => callback(...args), delay);
  };
}
