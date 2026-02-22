import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CURRENT_LANGUAGE, provideTranslationScope, useTranslation } from '@homj/composables/i18n';

import { ScopedDemoComponent } from './components/scoped/scoped-demo.component';
import { LazyDemoComponent } from './components/lazy/lazy-demo.component';

@Component({
    selector: 'demo-i18n-demo',
    imports: [ScopedDemoComponent, LazyDemoComponent],
    providers: [
        provideTranslationScope(
            'i18n-demo',
            (lang) => import(`./i18n/${lang}.json`).then((m) => m.default)
        )
    ],
    templateUrl: './i18n-demo.component.html',
    styleUrls: ['./i18n-demo.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class I18nDemoComponent {
    protected readonly lang = inject(CURRENT_LANGUAGE);
    protected readonly t = useTranslation();

    protected readonly languages = [
        { code: 'en', label: 'EN' },
        { code: 'de', label: 'DE' }
    ] as const;
}
