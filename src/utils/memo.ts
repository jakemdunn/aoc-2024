export const memo = <Arguments extends unknown[], Result>(
  func: (...args: Arguments) => Result,
  generateKey?: (args: Arguments) => string,
) => {
  const results = new Map<string, Result>();
  return (...args: Arguments) => {
    const key = (generateKey ?? JSON.stringify)(args);
    let memoized = results.get(key);
    if (!memoized) {
      memoized = func(...args);
      results.set(key, memoized);
    }
    return memoized;
  };
};
