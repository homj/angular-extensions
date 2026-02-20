import { inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

/**
 * Creates a signal that tracks the value of the given route parameter.
 * Uses the {@link ActivatedRoute} under the hood.
 *
 * @example
 * ```ts
 * // For a route like /users/:id
 * const userId = useRouteParam('id'); // userId() === '42'
 *
 * // When the route changes to /users/99
 * userId(); // '99'
 * ```
 *
 * @param name - The name of the route parameter to track
 * @returns A signal holding the current value of the route parameter, or null if not present
 */
export const useRouteParam = (name: string) => {
    const route = inject(ActivatedRoute);

    return toSignal(route.params.pipe(map((params) => (params[name] as string) ?? null)), {
        initialValue: (route.snapshot.params[name] as string) ?? null
    });
};

/**
 * Creates a signal that tracks the value of the given query parameter.
 * Uses the {@link ActivatedRoute} under the hood.
 *
 * @example
 * ```ts
 * // For a URL like /search?query=angular
 * const query = useQueryParam('query'); // query() === 'angular'
 *
 * // When the URL changes to /search?query=signals
 * query(); // 'signals'
 * ```
 *
 * @param name - The name of the query parameter to track
 * @returns A signal holding the current value of the query parameter, or null if not present
 */
export const useQueryParam = (name: string) => {
    const route = inject(ActivatedRoute);

    return toSignal(route.queryParams.pipe(map((params) => (params[name] as string) ?? null)), {
        initialValue: (route.snapshot.queryParams[name] as string) ?? null
    });
};
