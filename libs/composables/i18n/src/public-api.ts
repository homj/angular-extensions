/**
 * @packageDocumentation
 * Signal-based translation library with support for global and scoped namespaces,
 * backed by Angular's resource API for lazy async loading.
 *
 * @module @homj/composables/i18n
 */

export { TranslationData, TranslationLoader, TranslationParams, TranslateFn } from './models/translation.types';
export { CURRENT_LANGUAGE, TRANSLATION_LOADER, TRANSLATION_SCOPE, TranslationScopeConfig } from './tokens/translation.tokens';
export { TranslationStore } from './service/translation.store';
export { provideTranslation, provideTranslationScope } from './providers/translation.providers';
export { useTranslation } from './composables/use-translation.composable';
