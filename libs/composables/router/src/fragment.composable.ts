import { inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

/**
 * Creates a signal that tracks the URL fragment (the part after `#`).
 * Uses the {@link ActivatedRoute} under the hood.
 *
 * @example
 * ```ts
 * // For a URL like /docs/guide#installation
 * const fragment = useFragment(); // fragment() === 'installation'
 *
 * // When the URL changes to /docs/guide#usage
 * fragment(); // 'usage'
 *
 * // When navigating to /docs/guide (no fragment)
 * fragment(); // null
 * ```
 *
 * @returns A signal holding the current URL fragment, or null if there is none
 */
export const useFragment = () => {
    const route = inject(ActivatedRoute);

    return toSignal(route.fragment, {
        initialValue: route.snapshot.fragment
    });
};
