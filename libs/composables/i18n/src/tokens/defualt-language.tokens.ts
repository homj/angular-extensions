import { InjectionToken } from '@angular/core';
import { Language } from '../models/language';

export const DEFAULT_LANGUAGE = new InjectionToken<Language>('@homj/composables/i18n: default language');
