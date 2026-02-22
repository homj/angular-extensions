import { InjectionToken } from '@angular/core';
import { TranslationLoader } from '../models/translation.types';

/**
 * Injection token for the global (unscoped) translation loader.
 * Provided by {@link provideTranslation}.
 */
export const TRANSLATION_LOADER = new InjectionToken<TranslationLoader>('@homj/composables/i18n: global loader');

/**
 * Configuration object for a single translation scope.
 */
export interface TranslationScopeConfig {
    /** The scope identifier, matching the prefix before `:` in scoped translation keys. */
    scope: string;
    /** Loader function for this scope's translation data. */
    loader: TranslationLoader;
}

/**
 * Multi-injection token for scope-level translation loaders.
 * Each entry is a {@link TranslationScopeConfig} object.
 * Provided by {@link provideTranslationScope}.
 */
export const TRANSLATION_SCOPE = new InjectionToken<TranslationScopeConfig>('@homj/composables/i18n: scope config');
