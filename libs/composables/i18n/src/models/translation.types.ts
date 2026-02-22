import { Resource, Signal } from '@angular/core';
import { Language } from './language';
import { MaybeSignal } from './maybe-signal';

/**
 * A flat map of translation keys to their translated string values.
 */
export type TranslationData = Record<string, string>;

/**
 * A function that asynchronously loads translation data for a given language.
 * Receives the active language tag (e.g. `'en'`, `'de'`) and returns translation data.
 * Intended to be used with dynamic imports, e.g. `(lang) => import('./i18n/${lang}.json').then(m => m.default)`.
 */
export type TranslationLoader = (language: Language) => Promise<TranslationData>;

export type TranslationResource = Resource<TranslationData>;

/**
 * Parameters used for interpolating values into a translated string.
 * Keys correspond to the placeholder names used in translation strings (e.g. `{{ name }}`).
 */
export type TranslationParams = Record<string, string | number>;

/**
 * The translate function returned by {@link useTranslation}.
 *
 * - Global key: `t('title')` → looks up `title` in the global translation namespace
 * - Scoped key: `t('my-component:foo')` → looks up `foo` in the `my-component` scope
 *
 * The function is reactive: when called inside a signal reactive context
 * (template, `computed`, `effect`), it will cause a re-evaluation whenever
 * the underlying translations finish loading or change.
 *
 * @param key - A global key (`'title'`) or scoped key (`'scope:key'`)
 * @param params - Optional interpolation parameters (replaces `{{ paramName }}` placeholders)
 * @returns The translated string, or the key itself as a fallback while loading
 */
export type TranslateFn = (key: MaybeSignal<string>, params?: MaybeSignal<TranslationParams>) => string;
export type ScopedTranslateFn = TranslateFn & { global: TranslateFn };
