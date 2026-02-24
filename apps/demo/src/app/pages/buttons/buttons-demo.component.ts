import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { ButtonAppearance, ButtonColor, ButtonComponent } from '../../components/button/button.component';
import { OldButtonComponent } from '../../components/old-button/old-button.component';

@Component({
    selector: 'demo-buttons-demo',
    imports: [ButtonComponent, OldButtonComponent],
    templateUrl: './buttons-demo.component.html',
    styleUrls: ['./buttons-demo.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonsDemoComponent {
    readonly counter = signal(0);
    readonly disabled = signal(false);
    readonly loading = signal(false);
    readonly appearance = signal<ButtonAppearance>('solid');
    readonly color = signal<ButtonColor>(undefined);

    incrementCounter() {
        this.counter.update((value) => value + 1);
    }
}
