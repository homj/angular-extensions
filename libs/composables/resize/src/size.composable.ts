import { DestroyRef, ElementRef, inject, signal } from '@angular/core';

/**
 * Options for {@link useSize}
 */
export interface IUseSizeOptions {
    /**
     * The element to observe. Defaults to the host element of the current component.
     */
    target?: Element;

    /**
     * Which box model to use when observing size changes.
     *
     * - `'content-box'` - the size of the content area (default)
     * - `'border-box'` - the size of the border area
     * - `'device-pixel-content-box'` - the size in device pixels
     *
     * @defaultValue 'content-box'
     */
    box?: ResizeObserverBoxOptions;
}

type NormalizedUseSizeOptions = Required<IUseSizeOptions>;

/**
 * @internal
 * Normalizes options for {@link useSize}
 */
const normalizeUseSizeOptions = (options?: IUseSizeOptions): NormalizedUseSizeOptions => ({
    target: options?.target ?? inject(ElementRef).nativeElement,
    box: options?.box ?? 'content-box'
});

/**
 * Creates a signal that tracks the latest {@link ResizeObserverEntry} for the host element
 * (or a given target). Useful for building responsive components that need to react to
 * their own size rather than the viewport size.
 *
 * @example
 * ```ts
 * @Component({ ... })
 * class ResponsiveCardComponent {
 *     readonly sizeEntry = useSize();
 *     readonly width = computed(() => this.sizeEntry()?.contentRect.width ?? 0);
 *     readonly isCompact = computed(() => this.width() < 300);
 * }
 * ```
 *
 * @example
 * Observe with border-box sizing:
 * ```ts
 * const sizeEntry = useSize({ box: 'border-box' });
 * const borderWidth = computed(() => sizeEntry()?.borderBoxSize[0].inlineSize ?? 0);
 * ```
 *
 * @param options - A set of options for the observer
 * @returns A signal holding the latest resize entry, or undefined before the first observation
 */
export const useSize = (options?: IUseSizeOptions) => {
    const { target, box } = normalizeUseSizeOptions(options);
    const destroyRef = inject(DestroyRef, { optional: true });
    const entry = signal<ResizeObserverEntry | undefined>(undefined);

    const observer = new ResizeObserver(([e]) => entry.set(e));
    observer.observe(target, { box });

    if (destroyRef) {
        destroyRef.onDestroy(() => observer.disconnect());
    }

    return entry.asReadonly();
};
