import { inject, Injectable, Injector, resource, ResourceRef, runInInjectionContext, Signal } from '@angular/core';
import { TranslationData, TranslationLoader, TranslationParams } from '../models/translation.types';
import { TRANSLATION_LOADER } from '../tokens/translation.tokens';

/** Sentinel key used internally for the global (unscoped) translation namespace. */
const GLOBAL_SCOPE = '';

/**
 * @internal
 * Replaces `{{ paramName }}` placeholders in a string with values from the params map.
 */
const interpolate = (value: string, params: TranslationParams): string =>
    value.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => String(params[key] ?? key));

/**
 * Central store for all translation resources.
 *
 * Each scope (including the global scope) is backed by an Angular `resource()`
 * that loads translation data asynchronously. Resources are created lazily on
 * first access and cached for the lifetime of the store.
 *
 * You do not need to inject this service directly — use {@link useTranslation} instead.
 * It is exported to allow advanced testing scenarios.
 */
@Injectable()
export class TranslationStore {
    private readonly injector = inject(Injector);
    private readonly resources = new Map<string, ResourceRef<TranslationData>>();

    constructor() {
        const globalLoader = inject(TRANSLATION_LOADER, { optional: true });

        if (globalLoader) {
            this.ensureScope(GLOBAL_SCOPE, globalLoader);
        }
    }

    /**
     * Ensures a resource exists for the given scope.
     * If a resource for this scope already exists, this is a no-op.
     *
     * @param scope - The scope identifier, or `''` for the global namespace
     * @param loader - The loader function for this scope
     */
    ensureScope(scope: string, loader: TranslationLoader): void {
        if (this.resources.has(scope)) {
            return;
        }

        const ref = runInInjectionContext(this.injector, () =>
            resource<TranslationData, undefined>({
                loader: () => loader()
            })
        );

        this.resources.set(scope, ref);
    }

    /**
     * Returns the loading signal for a specific scope.
     * Useful for showing loading indicators.
     *
     * @param scope - The scope identifier, or `''` for the global namespace
     */
    isLoading(scope = GLOBAL_SCOPE): Signal<boolean> | undefined {
        return this.resources.get(scope)?.isLoading;
    }

    /**
     * Translates a key, optionally interpolating parameters.
     *
     * This method reads from signal values internally — calling it inside a
     * reactive context (template, `computed`, `effect`) will cause a re-evaluation
     * when the underlying resource finishes loading.
     *
     * @param key - A global key (`'title'`) or scoped key (`'scope:key'`)
     * @param params - Optional interpolation parameters
     * @returns The translated string, or the key itself as a fallback while loading
     */
    translate(key: string, params?: TranslationParams): string {
        const colonIdx = key.indexOf(':');

        let scope: string;
        let actualKey: string;

        if (colonIdx === -1) {
            scope = GLOBAL_SCOPE;
            actualKey = key;
        } else {
            scope = key.slice(0, colonIdx);
            actualKey = key.slice(colonIdx + 1);
        }

        const data = this.resources.get(scope)?.value();
        const value = data?.[actualKey] ?? key;

        return params ? interpolate(value, params) : value;
    }
}
