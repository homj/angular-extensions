import { DOCUMENT } from '@angular/common';
import { DestroyRef, inject, signal } from '@angular/core';

/**
 * Creates a signal that tracks the browser's online/offline status.
 * Useful for showing connectivity warnings or disabling features when offline.
 *
 * @example
 * ```ts
 * @Component({ ... })
 * class AppShellComponent {
 *     readonly isOnline = useOnlineStatus();
 *     readonly isOffline = computed(() => !this.isOnline());
 * }
 * ```
 *
 * ```html
 * @if (isOffline()) {
 *     <div class="offline-banner">You are currently offline</div>
 * }
 * ```
 *
 * @returns A signal holding `true` when the browser is online, `false` when offline
 */
export const useOnlineStatus = () => {
    const window = inject(DOCUMENT).defaultView;
    const destroyRef = inject(DestroyRef, { optional: true });
    const isOnline = signal(window?.navigator.onLine ?? true);

    const handleOnline = () => isOnline.set(true);
    const handleOffline = () => isOnline.set(false);

    window?.addEventListener('online', handleOnline);
    window?.addEventListener('offline', handleOffline);

    if (destroyRef) {
        destroyRef.onDestroy(() => {
            window?.removeEventListener('online', handleOnline);
            window?.removeEventListener('offline', handleOffline);
        });
    }

    return isOnline.asReadonly();
};
