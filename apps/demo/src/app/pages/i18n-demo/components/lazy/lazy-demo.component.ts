import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideTranslationScope, useLanguage, useTranslation } from '@homj/composables/i18n';

@Component({
    selector: 'demo-lazy-demo',
    providers: [provideTranslationScope('lazy-scope', (lang) => import(`./i18n/${lang}.json`).then((m) => m.default))],
    template: `
        <p class="lazy-title">{{ t('title') }}</p>
        <p>{{ t('message') }}</p>
        <p class="meta">{{ t('current-lang', { lang: lang() }) }}</p>
        Global key:
        <p class="meta">{{ t.global('welcome') }}</p>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LazyDemoComponent {
    protected readonly lang = useLanguage();
    protected readonly t = useTranslation('lazy-scope');
}
