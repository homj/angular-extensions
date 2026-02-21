import { TestBed } from '@angular/core/testing';
import { TranslationStore } from './translation.store';
import { TRANSLATION_LOADER } from '../tokens/translation.tokens';
import { TranslationData } from '../models/translation.types';

const GLOBAL_DATA: TranslationData = { title: 'Hello World', greeting: 'Hello, {{ name }}!' };
const SCOPE_DATA: TranslationData = { description: 'A description', label: 'Label' };

const resolvedLoader = (data: TranslationData) => () => Promise.resolve(data);

describe('TranslationStore', () => {
    describe('without a global loader', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [TranslationStore]
            });
        });

        it('should be created', () => {
            const store = TestBed.inject(TranslationStore);

            expect(store).toBeTruthy();
        });

        it('should return the key as fallback for an unknown global key', () => {
            const store = TestBed.inject(TranslationStore);

            expect(store.translate('title')).toEqual('title');
        });

        it('should return the full scoped key as fallback for an unknown scoped key', () => {
            const store = TestBed.inject(TranslationStore);

            expect(store.translate('my-scope:description')).toEqual('my-scope:description');
        });
    });

    describe('with a global loader', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [
                    TranslationStore,
                    { provide: TRANSLATION_LOADER, useValue: resolvedLoader(GLOBAL_DATA) }
                ]
            });
        });

        it('should return the key as fallback before translations are loaded', () => {
            const store = TestBed.inject(TranslationStore);

            expect(store.translate('title')).toEqual('title');
        });

        it('should return translated value after translations are loaded', async () => {
            const store = TestBed.inject(TranslationStore);

            await TestBed.inject(TestBed as any, { optional: true });

            // Flush microtasks so the resource promise resolves
            await new Promise<void>(resolve => setTimeout(resolve, 0));
            TestBed.flushEffects();

            expect(store.translate('title')).toEqual('Hello World');
        });

        it('should return key fallback for a missing translation key', async () => {
            const store = TestBed.inject(TranslationStore);

            await new Promise<void>(resolve => setTimeout(resolve, 0));
            TestBed.flushEffects();

            expect(store.translate('missing')).toEqual('missing');
        });

        it('should interpolate params after translations are loaded', async () => {
            const store = TestBed.inject(TranslationStore);

            await new Promise<void>(resolve => setTimeout(resolve, 0));
            TestBed.flushEffects();

            expect(store.translate('greeting', { name: 'Jane' })).toEqual('Hello, Jane!');
        });
    });

    describe('ensureScope', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [TranslationStore]
            });
        });

        it('should load translations for a registered scope', async () => {
            const store = TestBed.inject(TranslationStore);

            store.ensureScope('my-scope', resolvedLoader(SCOPE_DATA));

            await new Promise<void>(resolve => setTimeout(resolve, 0));
            TestBed.flushEffects();

            expect(store.translate('my-scope:description')).toEqual('A description');
        });

        it('should not create a second resource when called again with the same scope', () => {
            const store = TestBed.inject(TranslationStore);
            const loader = jest.fn().mockResolvedValue(SCOPE_DATA);

            store.ensureScope('my-scope', loader);
            store.ensureScope('my-scope', loader);

            expect(loader).toHaveBeenCalledTimes(1);
        });

        it('should return full scoped key as fallback before scope is loaded', () => {
            const store = TestBed.inject(TranslationStore);

            store.ensureScope('my-scope', resolvedLoader(SCOPE_DATA));

            expect(store.translate('my-scope:label')).toEqual('my-scope:label');
        });
    });

    describe('translate — key parsing', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [TranslationStore]
            });
        });

        it('should treat a key without ":" as global', async () => {
            const store = TestBed.inject(TranslationStore);

            store.ensureScope('', resolvedLoader(GLOBAL_DATA));

            await new Promise<void>(resolve => setTimeout(resolve, 0));
            TestBed.flushEffects();

            expect(store.translate('title')).toEqual('Hello World');
        });

        it('should split on the first ":" only', async () => {
            const data: TranslationData = { 'foo:bar': 'value' };
            const store = TestBed.inject(TranslationStore);

            store.ensureScope('scope', resolvedLoader(data));

            await new Promise<void>(resolve => setTimeout(resolve, 0));
            TestBed.flushEffects();

            expect(store.translate('scope:foo:bar')).toEqual('scope:foo:bar');
        });
    });

    describe('interpolation', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [
                    TranslationStore,
                    { provide: TRANSLATION_LOADER, useValue: resolvedLoader(GLOBAL_DATA) }
                ]
            });
        });

        it('should replace {{ param }} placeholders', async () => {
            const store = TestBed.inject(TranslationStore);

            await new Promise<void>(resolve => setTimeout(resolve, 0));
            TestBed.flushEffects();

            expect(store.translate('greeting', { name: 'Alice' })).toEqual('Hello, Alice!');
        });

        it('should keep placeholder text for missing params', async () => {
            const store = TestBed.inject(TranslationStore);

            await new Promise<void>(resolve => setTimeout(resolve, 0));
            TestBed.flushEffects();

            expect(store.translate('greeting', {})).toEqual('Hello, name!');
        });

        it('should support numeric param values', async () => {
            const data: TranslationData = { count: 'Total: {{ n }}' };
            const store = TestBed.inject(TranslationStore);

            store.ensureScope('', resolvedLoader(data));

            await new Promise<void>(resolve => setTimeout(resolve, 0));
            TestBed.flushEffects();

            expect(store.translate('count', { n: 42 })).toEqual('Total: 42');
        });
    });
});
