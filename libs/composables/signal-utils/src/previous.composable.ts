import { effect, Signal, signal, untracked } from '@angular/core';

/**
 * Creates a read-only signal that always holds the **previous** value of the given source signal.
 * The initial value is `undefined` (before the source has changed for the first time).
 *
 * This is useful for implementing undo/redo, change detection, transition animations,
 * or any logic that needs to compare the old and new value.
 *
 * @example
 * ```ts
 * @Component({ ... })
 * class CounterComponent {
 *     readonly count = signal(0);
 *     readonly previousCount = previous(this.count);
 *
 *     increment() {
 *         this.count.update(v => v + 1);
 *         // previousCount() now holds the old value
 *         console.log(`Changed from ${this.previousCount()} to ${this.count()}`);
 *     }
 * }
 * ```
 *
 * @example
 * Detect the direction of a tab change:
 * ```ts
 * readonly activeTab = signal(0);
 * readonly prevTab = previous(this.activeTab);
 * readonly direction = computed(() =>
 *     (this.prevTab() ?? 0) < this.activeTab() ? 'forward' : 'back'
 * );
 * ```
 *
 * @param source - The source signal to track
 * @returns A read-only signal holding the previous value of the source signal
 */
export const previous = <T>(source: Signal<T>) => {
    let prev: T | undefined = undefined;
    const result = signal<T | undefined>(undefined);

    effect(() => {
        const current = source();
        untracked(() => {
            result.set(prev);
            prev = current;
        });
    });

    return result.asReadonly();
};
