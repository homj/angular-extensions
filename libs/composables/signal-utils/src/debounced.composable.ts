import { DestroyRef, effect, EffectRef, inject, Signal, signal } from '@angular/core';

/**
 * Creates a read-only signal that mirrors the given source signal but delays emitting
 * new values until the source has stopped changing for the specified `delay` in milliseconds.
 * This is useful for avoiding expensive operations (like HTTP requests or complex computations)
 * on every keystroke or rapid change.
 *
 * @example
 * ```ts
 * @Component({ ... })
 * class SearchComponent {
 *     readonly query = signal('');
 *     readonly debouncedQuery = debounced(this.query, 300);
 *
 *     constructor() {
 *         // Only fires after the user stops typing for 300ms
 *         effect(() => this.search(this.debouncedQuery()));
 *     }
 * }
 * ```
 *
 * @param source - The source signal to debounce
 * @param delay - The debounce delay in milliseconds
 * @returns A read-only signal that emits the source value after the delay has passed without a new value
 */
export const debounced = <T>(source: Signal<T>, delay: number) => {
    const destroyRef = inject(DestroyRef, { optional: true });
    const result = signal<T>(source());
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const effectRef: EffectRef = effect(() => {
        const value = source();
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => result.set(value), delay);
    });

    if (destroyRef) {
        destroyRef.onDestroy(() => {
            effectRef.destroy();
            clearTimeout(timeoutId);
        });
    }

    return result.asReadonly();
};
