import {
    computed,
    inject,
    Injectable,
    Injector,
    isSignal,
    resource,
    runInInjectionContext,
    signal,
    Signal
} from '@angular/core';
import { Language } from '../models/language';
import { TranslationLoader, TranslationParams, TranslationResource } from '../models/translation.types';
import { DEFAULT_LANGUAGE } from '../tokens/defualt-language.tokens';
import { TRANSLATION_LOADER } from '../tokens/translation.tokens';
import { inject, Injectable, Injector, resource, ResourceRef, runInInjectionContext, Signal, WritableSignal } from '@angular/core';
import { TranslationData, TranslationLoader, TranslationParams } from '../models/translation.types';
import { CURRENT_LANGUAGE, TRANSLATION_LOADER } from '../tokens/translation.tokens';

/** Sentinel key used internally for the global (unscoped) translation namespace. */
const GLOBAL_SCOPE = Symbol('global');
type Scope = string | symbol;

const isResource = (value: unknown): value is TranslationResource => value != null && 'value' in (value as object);

const getScopeAndPath = (key: string) => {
    const colonIdx = key.indexOf(':');

    let scope: Scope;
    let path: string;

    if (colonIdx === -1) {
        scope = GLOBAL_SCOPE;
        path = key;
    } else {
        scope = key.slice(0, colonIdx);
        path = key.slice(colonIdx + 1);
    }

    return { scope, path };
};

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
    private readonly resources = new Map<Scope, TranslationResource>();
    readonly language = signal<Language>(inject(DEFAULT_LANGUAGE));

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
    ensureScope(scope: Scope, loader: TranslationLoader | TranslationResource): void {
        if (this.resources.has(scope)) {
            return;
        }

        const ref = isResource(loader)
            ? loader
            : runInInjectionContext(
                  this.injector,
                  () =>
                      resource({
                          params: () => ({ language: this.language() }),
                          loader: ({ params }) => loader(params.language)
                      }) as TranslationResource
              );

        this.resources.set(scope, ref);
    }

    /**
     * Returns the loading signal for a specific scope.
     * Useful for showing loading indicators.
     *
     * @param scope - The scope identifier, or `''` for the global namespace
     */
    isLoading(scope: Scope = GLOBAL_SCOPE): Signal<boolean> | undefined {
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
    translate(
        key: string | Signal<string>,
        params?: TranslationParams | Signal<TranslationParams | undefined>
    ): Signal<string> {
        return computed(() => {
            const resolvedKey = isSignal(key) ? key() : key;
            const resolvedParams = isSignal(params) ? params() : params;
            const { scope, path } = getScopeAndPath(resolvedKey);

            const resource = this.resources.get(scope);

            if (!resource) {
                throw new Error(
                    `Resource not defined for ${scope === GLOBAL_SCOPE ? 'global scope' : `scope '${scope as string}'`}`
                );
            }

            if (!resource.hasValue()) {
                return resolvedKey; // TODO: Loading / Error handler
            }

            const data = resource.value();
            const value = data?.[path] ?? resolvedKey; // TODO: Missing translation handler

            return resolvedParams ? interpolate(value, resolvedParams) : value;
        });
    }
}
