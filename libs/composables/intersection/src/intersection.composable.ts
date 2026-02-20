import { computed, DestroyRef, ElementRef, inject, signal } from '@angular/core';

/**
 * Options for {@link useIntersection} and {@link useVisible}
 */
export interface IUseIntersectionOptions {
    /**
     * The element to observe. Defaults to the host element of the current component.
     */
    target?: Element;

    /**
     * The element used as the viewport for checking visibility.
     * Defaults to the browser viewport.
     */
    root?: Element | Document | null;

    /**
     * Margin around the root element. Accepts values similar to CSS `margin`.
     *
     * @defaultValue '0px'
     */
    rootMargin?: string;

    /**
     * A single threshold or list of thresholds at which the observer callback is invoked.
     * A value of `0` means the callback fires as soon as even one pixel is visible.
     * A value of `1.0` means the callback fires only when the element is fully visible.
     *
     * @defaultValue 0
     */
    threshold?: number | number[];
}

type NormalizedUseIntersectionOptions = Required<Omit<IUseIntersectionOptions, 'root'>> & {
    root?: Element | Document | null;
};

/**
 * @internal
 * Normalizes the options for {@link useIntersection}
 */
const normalizeUseIntersectionOptions = (options?: IUseIntersectionOptions): NormalizedUseIntersectionOptions => ({
    target: options?.target ?? inject(ElementRef).nativeElement,
    root: options?.root,
    rootMargin: options?.rootMargin ?? '0px',
    threshold: options?.threshold ?? 0
});

/**
 * Creates a signal that tracks the latest {@link IntersectionObserverEntry} for the host element
 * (or a given target). Useful for implementing lazy loading, scroll-triggered animations,
 * and infinite scroll.
 *
 * @example
 * ```ts
 * @Component({ ... })
 * class LazyImageComponent {
 *     readonly intersection = useIntersection({ threshold: 0.5 });
 *     readonly ratio = computed(() => this.intersection()?.intersectionRatio ?? 0);
 * }
 * ```
 *
 * @param options - A set of options for the observer
 * @returns A signal holding the latest intersection entry, or undefined before the first observation
 */
export const useIntersection = (options?: IUseIntersectionOptions) => {
    const { target, root, rootMargin, threshold } = normalizeUseIntersectionOptions(options);
    const destroyRef = inject(DestroyRef, { optional: true });
    const entry = signal<IntersectionObserverEntry | undefined>(undefined);

    const observer = new IntersectionObserver(([e]) => entry.set(e), {
        root: root ?? null,
        rootMargin,
        threshold
    });

    observer.observe(target);

    if (destroyRef) {
        destroyRef.onDestroy(() => observer.disconnect());
    }

    return entry.asReadonly();
};

/**
 * Creates a signal that tracks whether the host element (or a given target)
 * is currently intersecting the viewport (or a given root element).
 *
 * @example
 * ```ts
 * @Component({ ... })
 * class AnimatedCardComponent {
 *     readonly isVisible = useVisible();
 *     readonly animationClass = computed(() => this.isVisible() ? 'slide-in' : 'hidden');
 * }
 * ```
 *
 * @example
 * Trigger only when the element is 50% visible:
 * ```ts
 * const isHalfVisible = useVisible({ threshold: 0.5 });
 * ```
 *
 * @param options - A set of options for the observer
 * @returns A signal holding whether the element is currently intersecting
 */
export const useVisible = (options?: IUseIntersectionOptions) => {
    const entry = useIntersection(options);
    return computed(() => entry()?.isIntersecting ?? false);
};
