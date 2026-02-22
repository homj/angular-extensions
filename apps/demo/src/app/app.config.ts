import { ApplicationConfig } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation } from '@angular/router';
import { provideTranslation } from '@homj/composables/i18n';

import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(appRoutes, withEnabledBlockingInitialNavigation()),
        provideTranslation(
            (lang) => import(`./i18n/${lang}.json`).then((m) => m.default),
            'en'
        )
    ]
};
