import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { startWith } from 'rxjs';

/**
 * Creates a signal that tracks the current value of the given form control.
 * The signal is updated whenever the control's value changes.
 *
 * @example
 * ```ts
 * @Component({ ... })
 * class SearchComponent {
 *     readonly searchControl = new FormControl('');
 *     readonly searchValue = useFormValue(this.searchControl);
 *
 *     constructor() {
 *         // react to search value changes
 *         effect(() => console.log('Searching for:', this.searchValue()));
 *     }
 * }
 * ```
 *
 * @example
 * Works equally well with a `FormGroup`:
 * ```ts
 * @Component({ ... })
 * class SignupComponent {
 *     readonly form = new FormGroup({
 *         email: new FormControl(''),
 *         password: new FormControl('')
 *     });
 *     readonly formValue = useFormValue(this.form);
 *     // formValue() === { email: '', password: '' }
 * }
 * ```
 *
 * @param control - The form control to track
 * @returns A signal holding the current value of the given form control
 */
export const useFormValue = <T = unknown>(control: AbstractControl<T>): Signal<T> => {
    return toSignal(control.valueChanges.pipe(startWith(control.value)), {
        requireSync: true
    });
};
