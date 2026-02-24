import { Route } from '@angular/router';

export const appRoutes: Route[] = [
    { path: '', redirectTo: 'buttons', pathMatch: 'full' },
    {
        path: 'buttons',
        loadComponent: () => import('./pages/buttons/buttons-demo.component').then((m) => m.ButtonsDemoComponent)
    },
    {
        path: 'i18n',
        loadComponent: () => import('./pages/i18n-demo/i18n-demo.component').then((m) => m.I18nDemoComponent)
    }
];
