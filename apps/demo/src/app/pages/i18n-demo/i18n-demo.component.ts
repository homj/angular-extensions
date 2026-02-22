import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Language, provideTranslationScope, useLanguage, useTranslation } from '@homj/composables/i18n';
import { LazyDemoComponent } from './components/lazy/lazy-demo.component';

import { ScopedDemoComponent } from './components/scoped/scoped-demo.component';

@Component({
    selector: 'demo-i18n-demo',
    imports: [ScopedDemoComponent, LazyDemoComponent],
    providers: [provideTranslationScope('i18n-demo', (lang) => import(`./i18n/${lang}.json`).then((m) => m.default))],
    templateUrl: './i18n-demo.component.html',
    styleUrls: ['./i18n-demo.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class I18nDemoComponent {
    protected readonly lang = useLanguage();
    protected readonly t = useTranslation();

    protected readonly languages = [
        { code: 'en' as Language, label: 'EN' },
        { code: 'de' as Language, label: 'DE' }
    ] as const;
}
