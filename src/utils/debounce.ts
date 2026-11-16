type DebounceFunction<T extends (...args: never[]) => unknown> = ((
  ...args: Parameters<T>
) => void) & { cancel: () => void };

export function debounce<T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number,
): DebounceFunction<T> {
  let timerId: ReturnType<typeof setTimeout> | undefined;

  const debounced = (...args: Parameters<T>): void => {
    if (timerId !== undefined) clearTimeout(timerId);
    timerId = setTimeout(() => {
      timerId = undefined;
      callback(...args);
    }, delay);
  };

  const cancel = (): void => {
    if (timerId !== undefined) {
      clearTimeout(timerId);
      timerId = undefined;
    }
  };

  return Object.assign(debounced, { cancel });
}
