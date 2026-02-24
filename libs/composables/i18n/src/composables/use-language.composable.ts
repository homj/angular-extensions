import { inject } from '@angular/core';
import { TranslationStore } from '../service/translation.store';

export const useLanguage = () => {
    const store = inject(TranslationStore);
    return store.language;
};
