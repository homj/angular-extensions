import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControlStatus, ValidationErrors } from '@angular/forms';
import { map, startWith } from 'rxjs';

/**
 * Creates a signal that tracks the validation status of the given form control.
 * The status is one of `'VALID'`, `'INVALID'`, `'PENDING'`, or `'DISABLED'`.
 *
 * @example
 * ```ts
 * @Component({ ... })
 * class LoginComponent {
 *     readonly emailControl = new FormControl('', [Validators.required, Validators.email]);
 *     readonly emailStatus = useFormStatus(this.emailControl);
 *     readonly isEmailValid = computed(() => this.emailStatus() === 'VALID');
 *     readonly isEmailPending = computed(() => this.emailStatus() === 'PENDING');
 * }
 * ```
 *
 * @param control - The form control to track
 * @returns A signal holding the current validation status of the given form control
 */
export const useFormStatus = (control: AbstractControl): Signal<FormControlStatus> => {
    return toSignal(control.statusChanges.pipe(startWith(control.status)), {
        requireSync: true
    });
};

/**
 * Creates a signal that tracks the validation errors of the given form control.
 * The signal holds `null` when the control is valid, or an object of validation errors when invalid.
 *
 * @example
 * ```ts
 * @Component({ ... })
 * class RegistrationComponent {
 *     readonly passwordControl = new FormControl('', [
 *         Validators.required,
 *         Validators.minLength(8)
 *     ]);
 *     readonly passwordErrors = useFormErrors(this.passwordControl);
 *     readonly hasMinLengthError = computed(() => !!this.passwordErrors()?.['minlength']);
 * }
 * ```
 *
 * @param control - The form control to track
 * @returns A signal holding the current validation errors, or null if the control is valid
 */
export const useFormErrors = (control: AbstractControl): Signal<ValidationErrors | null> => {
    return toSignal(
        control.statusChanges.pipe(
            startWith(control.status),
            map(() => control.errors)
        ),
        { requireSync: true }
    );
};
