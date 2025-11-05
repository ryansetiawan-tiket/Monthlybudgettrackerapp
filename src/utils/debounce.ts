/**
 * Debounce Utility
 * 
 * Delays the execution of a function until after a specified wait time
 * has elapsed since the last time it was invoked.
 * 
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns A debounced version of the function
 * 
 * @example
 * const debouncedSave = debounce((value: string) => {
 *   saveToDatabase(value);
 * }, 500);
 * 
 * // Will only call saveToDatabase once after user stops typing for 500ms
 * input.addEventListener('input', (e) => debouncedSave(e.target.value));
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function debounced(...args: Parameters<T>) {
    // Clear existing timeout
    if (timeout !== null) {
      clearTimeout(timeout);
    }

    // Set new timeout
    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  };
}

/**
 * Debounce with immediate execution option
 * 
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @param immediate - If true, trigger function on leading edge instead of trailing
 * @returns A debounced version of the function
 * 
 * @example
 * const debouncedClick = debounceImmediate(() => {
 *   handleButtonClick();
 * }, 1000, true);
 * 
 * // Will call immediately, then ignore subsequent calls for 1 second
 * button.addEventListener('click', debouncedClick);
 */
export function debounceImmediate<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function debounced(...args: Parameters<T>) {
    const callNow = immediate && timeout === null;

    if (timeout !== null) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) {
        func(...args);
      }
    }, wait);

    if (callNow) {
      func(...args);
    }
  };
}

/**
 * Throttle Utility
 * 
 * Ensures a function is called at most once per specified time period.
 * Unlike debounce, throttle guarantees execution at regular intervals.
 * 
 * @param func - The function to throttle
 * @param limit - The minimum time (in ms) between function calls
 * @returns A throttled version of the function
 * 
 * @example
 * const throttledScroll = throttle(() => {
 *   handleScroll();
 * }, 100);
 * 
 * // Will call handleScroll at most once every 100ms
 * window.addEventListener('scroll', throttledScroll);
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;

  return function throttled(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
        // Call with last args if function was called during throttle
        if (lastArgs !== null) {
          func(...lastArgs);
          lastArgs = null;
        }
      }, limit);
    } else {
      // Store last args to call after throttle period
      lastArgs = args;
    }
  };
}
