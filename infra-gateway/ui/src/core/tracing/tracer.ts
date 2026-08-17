export const tracer = {
  startActiveSpan: <T>(_name: string, fn: (span: any) => Promise<T>): Promise<T> => {
    const mockSpan = {
      setAttribute: () => {},
      setStatus: () => {},
      recordException: () => {},
      end: () => {},
    };
    return fn(mockSpan);
  },
  startSpan: (_name: string, _options?: any) => ({ end: () => {} }),
};
