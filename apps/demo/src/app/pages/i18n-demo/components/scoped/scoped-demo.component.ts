import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideTranslationScope, useTranslation } from '@homj/composables/i18n';

@Component({
    selector: 'demo-scoped-demo',
    providers: [provideTranslationScope('user-card', (lang) => import(`./i18n/${lang}.json`).then((m) => m.default))],
    template: `
        <dl>
            <dt>Name</dt>
            <dd>{{ t('user-card:name') }}</dd>
            <dt>Role</dt>
            <dd>{{ t('user-card:role') }}</dd>
            <dt>Bio</dt>
            <dd>{{ t('user-card:bio') }}</dd>
        </dl>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScopedDemoComponent {
    protected readonly t = useTranslation();
}
