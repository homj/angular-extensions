import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CURRENT_LANGUAGE, provideTranslationScope, useTranslation } from '@homj/composables/i18n';

@Component({
    selector: 'demo-lazy-demo',
    providers: [
        provideTranslationScope(
            'lazy-scope',
            (lang) => import(`./i18n/${lang}.json`).then((m) => m.default)
        )
    ],
    template: `
        <p class="lazy-title">{{ t('lazy-scope:title') }}</p>
        <p>{{ t('lazy-scope:message') }}</p>
        <p class="meta">{{ t('lazy-scope:current-lang', { lang: lang() }) }}</p>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LazyDemoComponent {
    protected readonly t = useTranslation();
    protected readonly lang = inject(CURRENT_LANGUAGE);
}
