let controller: AbortController | null = null;

export const getAbortSignal = (): AbortSignal => {
  if (controller) {
    controller.abort();
  }
  controller = new AbortController();
  return controller.signal;
};
