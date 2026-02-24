import { TranslationParser } from '../models/translation.types';

/**
 * The default {@link TranslationParser}.
 *
 * Replaces `{{ paramName }}` placeholders in a pattern string with values from
 * the params map. If a param key is missing, the placeholder name itself is used
 * as a fallback so the output is always a readable string.
 *
 * Leading and trailing whitespace inside the braces is ignored, so both
 * `{{ name }}` and `{{name}}` are valid.
 *
 * @example
 * ```ts
 * interpolationParser('Hello, {{ name }}!', 'en', { name: 'Jane' })
 * // → 'Hello, Jane!'
 *
 * interpolationParser('{{ greeting }}, {{ name }}!', 'en', { greeting: 'Hi' })
 * // → 'Hi, name!'  ← missing param falls back to placeholder name
 * ```
 */
export const interpolationParser: TranslationParser = (
    pattern: string,
    _lang: string,
    params
): string => {
    if (!params) return pattern;

    return pattern.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => String(params[key] ?? key));
};
