import { EnvironmentProviders, makeEnvironmentProviders, Provider, signal } from '@angular/core';
import { TranslationLoader } from '../models/translation.types';
import { CURRENT_LANGUAGE, TRANSLATION_LOADER, TRANSLATION_SCOPE } from '../tokens/translation.tokens';
import { TranslationStore } from '../service/translation.store';

/**
 * Registers the {@link TranslationStore} and optionally a global translation loader
 * at the environment (application or route) level.
 *
 * Call this once in your `ApplicationConfig` providers (or in a lazy-loaded route's
 * `providers` array). Scoped translations can then be added per-component with
 * {@link provideTranslationScope}.
 *
 * @example
 * ```ts
 * // app.config.ts
 * export const appConfig: ApplicationConfig = {
 *     providers: [
 *         provideTranslation(
 *             (lang) => import(`./i18n/${lang}.json`).then(m => m.default),
 *             'en'
 *         )
 *     ]
 * };
 * ```
 *
 * @example
 * Without a global loader (only scoped translations):
 * ```ts
 * provideTranslation()
 * ```
 *
 * @param loader - Optional loader for the global (unscoped) translations
 * @param defaultLang - The initial active language tag (defaults to `'en'`)
 * @returns Environment providers for the translation system
 */
export function provideTranslation(loader?: TranslationLoader, defaultLang = 'en'): EnvironmentProviders {
    return makeEnvironmentProviders([
        TranslationStore,
        { provide: CURRENT_LANGUAGE, useValue: signal(defaultLang) },
        ...(loader ? [{ provide: TRANSLATION_LOADER, useValue: loader }] : [])
    ]);
}

/**
 * Registers a local scope loader for a specific translation scope.
 *
 * Add this to a component's (or directive's) `providers` array alongside
 * {@link useTranslation} inside that component.
 *
 * The loader is lazy — it only runs when `useTranslation` is first called in
 * the component's injection context and a key for this scope is looked up.
 *
 * @example
 * ```ts
 * @Component({
 *     selector: 'my-component',
 *     providers: [
 *         provideTranslationScope('my-component', (lang) => import(`./i18n/${lang}.json`).then(m => m.default))
 *     ],
 *     template: `
 *         <h1>{{ t('title') }}</h1>
 *         <p>{{ t('my-component:description') }}</p>
 *     `
 * })
 * class MyComponent {
 *     t = useTranslation();
 * }
 * ```
 *
 * @param scope - The scope identifier used as the prefix in translation keys, e.g. `'my-component'`
 * @param loader - Loader function for this scope's translations
 * @returns Component-level providers for the translation scope
 */
export function provideTranslationScope(scope: string, loader: TranslationLoader): Provider[] {
    return [
        {
            provide: TRANSLATION_SCOPE,
            useValue: { scope, loader },
            multi: true
        }
    ];
}
