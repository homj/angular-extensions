import { inject } from '@angular/core';
import { TranslateFn } from '../models/translation.types';
import { TRANSLATION_SCOPE, TranslationScopeConfig } from '../tokens/translation.tokens';
import { TranslationStore } from '../service/translation.store';

/**
 * Returns a reactive translate function `t` that resolves translation keys to strings.
 *
 * **Key format:**
 * - Global: `t('title')` — looks up `title` in the global translation namespace
 * - Scoped: `t('my-component:foo')` — looks up `foo` in the `my-component` scope
 *
 * **Reactivity:**
 * The returned function reads from Angular signal resources internally.
 * When called inside a reactive context — a component template, `computed()`, or `effect()` —
 * Angular tracks the read and will re-evaluate the expression once translations finish loading.
 * While loading, the key itself is returned as a fallback.
 *
 * **Interpolation:**
 * Pass a params object as the second argument to replace `{{ paramName }}` placeholders:
 * ```ts
 * t('greeting', { name: 'Jane' }) // "Hello, Jane!" (if translation is "Hello, {{ name }}!")
 * ```
 *
 * **Setup:**
 * Requires {@link provideTranslation} to be called in the environment providers.
 * Scope-level loaders are registered via {@link provideTranslationScope} in the
 * component's `providers` array.
 *
 * @example
 * ```ts
 * @Component({
 *     selector: 'app-root',
 *     template: `<h1>{{ t('title') }}</h1>`
 * })
 * class AppComponent {
 *     t = useTranslation();
 * }
 * ```
 *
 * @example
 * With a local scope:
 * ```ts
 * @Component({
 *     selector: 'my-component',
 *     providers: [
 *         provideTranslationScope('my-component', () => import('./i18n/en.json'))
 *     ],
 *     template: `<p>{{ t('my-component:description') }}</p>`
 * })
 * class MyComponent {
 *     t = useTranslation();
 * }
 * ```
 *
 * @returns A reactive {@link TranslateFn}
 */
export function useTranslation(): TranslateFn {
    const store = inject(TranslationStore);
    const scopes = inject(TRANSLATION_SCOPE, { optional: true }) as TranslationScopeConfig[] | null;

    scopes?.forEach(({ scope, loader }) => store.ensureScope(scope, loader));

    return (key: string, params?) => store.translate(key, params);
}
