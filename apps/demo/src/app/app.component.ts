import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { bindTitle } from '@homj/composables/title';
import { signal } from '@angular/core';

import { ColorSchemeSwitchComponent } from './components/color-scheme-switch/color-scheme-switch.component';

@Component({
    imports: [RouterModule, ColorSchemeSwitchComponent],
    selector: 'demo-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
    readonly title = bindTitle(signal('@homj/composables'));
}
