export const getErrorType = (error: unknown): 'abort' | 'timeout' | 'unknown' => {
  if (error instanceof DOMException) {
    if (error.name === 'AbortError') return 'abort';
    if (error.name === 'TimeoutError') return 'timeout';
  }

  return 'unknown';
};
