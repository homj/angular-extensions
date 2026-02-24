import { TranslationParams, TranslationParser } from '../models/translation.types';

/** A compiled ICU MessageFormat function ready to format params into a string. */
type CompiledMessage = (params?: Record<string, unknown>) => string;

/** A MessageFormat compiler instance (one per locale). */
interface MessageFormatInstance {
    compile(pattern: string): CompiledMessage;
}

/**
 * Minimal structural type for a MessageFormat constructor.
 *
 * Compatible with `@messageformat/core` (v3 / v4) and any library that exposes
 * a class taking a locale and returning an object with a `compile` method.
 *
 * @example
 * ```ts
 * import MessageFormat from '@messageformat/core';
 * // typeof MessageFormat satisfies MessageFormatLike ✓
 * ```
 */
export interface MessageFormatLike {
    new (locale: string | string[]): MessageFormatInstance;
}

/**
 * Creates a {@link TranslationParser} that formats ICU MessageFormat patterns using
 * any MessageFormat-compatible library (e.g. `@messageformat/core`).
 *
 * **Features**
 * - One compiler instance is created per locale and reused for all patterns.
 * - Compiled pattern functions are cached by `lang + pattern`, so each pattern is
 *   compiled at most once per active language.
 * - When the active language changes, patterns for the new language are compiled on demand.
 *
 * **Peer dependency**
 *
 * This factory does not bundle a MessageFormat implementation. Install the library of
 * your choice and pass its constructor:
 *
 * ```sh
 * npm install @messageformat/core
 * ```
 *
 * @example
 * ```ts
 * // app.config.ts
 * import MessageFormat from '@messageformat/core';
 * import { provideTranslation, withMessageFormat } from '@homj/composables/i18n';
 *
 * export const appConfig: ApplicationConfig = {
 *     providers: [
 *         provideTranslation(
 *             (lang) => import(`./i18n/${lang}.json`).then(m => m.default),
 *             'en',
 *             withMessageFormat(MessageFormat)
 *         )
 *     ]
 * };
 * ```
 *
 * Translation file (ICU syntax):
 * ```json
 * {
 *   "greeting": "Hello, {name}!",
 *   "inbox": "You have {count, plural, one {# message} other {# messages}}."
 * }
 * ```
 *
 * Component usage — identical to the default parser:
 * ```ts
 * t('greeting', { name: 'Jane' })          // → 'Hello, Jane!'
 * t('inbox',    { count: 1 })              // → 'You have 1 message.'
 * t('inbox',    { count: 5 })              // → 'You have 5 messages.'
 * ```
 *
 * @param MessageFormat - A MessageFormat constructor compatible with {@link MessageFormatLike}
 * @returns A {@link TranslationParser} backed by the supplied MessageFormat implementation
 */
export function withMessageFormat(MessageFormat: MessageFormatLike): TranslationParser {
    const instances = new Map<string, MessageFormatInstance>();
    const cache = new Map<string, CompiledMessage>();

    return (pattern: string, lang: string, params?: TranslationParams): string => {
        const cacheKey = `${lang}::${pattern}`;

        if (!cache.has(cacheKey)) {
            if (!instances.has(lang)) {
                instances.set(lang, new MessageFormat(lang));
            }

            cache.set(cacheKey, instances.get(lang)!.compile(pattern));
        }

        return cache.get(cacheKey)!(params as Record<string, unknown>);
    };
}
