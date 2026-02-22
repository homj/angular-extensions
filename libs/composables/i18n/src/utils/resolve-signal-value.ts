import { isSignal } from '@angular/core';
import { MaybeSignal } from '../models/maybe-signal';

export const resolveSignalValue = <T>(maybeSignal: MaybeSignal<T>): T =>
    isSignal(maybeSignal) ? maybeSignal() : maybeSignal;
