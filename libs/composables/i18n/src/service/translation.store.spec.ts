import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTranslation } from '../providers/translation.providers';
import { TranslationData } from '../models/translation.types';
import { TRANSLATION_LOADER, TRANSLATION_PARSER } from '../tokens/translation.tokens';
import { DEFAULT_LANGUAGE } from '../tokens/defualt-language.tokens';
import { Language } from '../models/language';
import { TranslationStore } from './translation.store';

const GLOBAL_DATA: TranslationData = { title: 'Hello World', greeting: 'Hello, {{ name }}!' };
const SCOPE_DATA: TranslationData = { description: 'A description', label: 'Label' };

const resolvedLoader = (data: TranslationData) => (_lang: string) => Promise.resolve(data);

/** Provides DEFAULT_LANGUAGE when bypassing provideTranslation() in tests. */
const withLang = (lang: Language = 'en' as Language) => ({ provide: DEFAULT_LANGUAGE, useValue: lang });

describe('TranslationStore', () => {
    describe('without a global loader', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [provideTranslation()]
            });
        });

        it('should be created', () => {
            const store = TestBed.inject(TranslationStore);

            expect(store).toBeTruthy();
        });

        it('should return the key as fallback for an unknown global key', () => {
            const store = TestBed.inject(TranslationStore);

            expect(store.translate('title')()).toEqual('title');
        });

        it('should return the full scoped key as fallback for an unknown scoped key', () => {
            const store = TestBed.inject(TranslationStore);

            expect(store.translate('my-scope:description')()).toEqual('my-scope:description');
        });
    });

    describe('with a global loader', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [TranslationStore, withLang(), { provide: TRANSLATION_LOADER, useValue: resolvedLoader(GLOBAL_DATA) }]
            });
        });

        it('should return the key as fallback before translations are loaded', () => {
            const store = TestBed.inject(TranslationStore);

            expect(store.translate('title')()).toEqual('title');
        });

        it('should return translated value after translations are loaded', async () => {
            const store = TestBed.inject(TranslationStore);

            // Flush microtasks so the resource promise resolves
            await new Promise<void>((resolve) => setTimeout(resolve, 0));
            TestBed.flushEffects();

            expect(store.translate('title')()).toEqual('Hello World');
        });

        it('should return key fallback for a missing translation key', async () => {
            const store = TestBed.inject(TranslationStore);

            await new Promise<void>((resolve) => setTimeout(resolve, 0));
            TestBed.flushEffects();

            expect(store.translate('missing')()).toEqual('missing');
        });

        it('should interpolate params after translations are loaded', async () => {
            const store = TestBed.inject(TranslationStore);

            await new Promise<void>((resolve) => setTimeout(resolve, 0));
            TestBed.flushEffects();

            expect(store.translate('greeting', { name: 'Jane' })()).toEqual('Hello, Jane!');
        });
    });

    describe('ensureScope', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [provideTranslation()]
            });
        });

        it('should load translations for a registered scope', async () => {
            const store = TestBed.inject(TranslationStore);

            store.ensureScope('my-scope', resolvedLoader(SCOPE_DATA));

            await new Promise<void>((resolve) => setTimeout(resolve, 0));
            TestBed.flushEffects();

            expect(store.translate('my-scope:description')()).toEqual('A description');
        });

        it('should not create a second resource when called again with the same scope', async () => {
            const store = TestBed.inject(TranslationStore);
            const loader = jest.fn().mockResolvedValue(SCOPE_DATA);

            store.ensureScope('my-scope', loader);
            store.ensureScope('my-scope', loader);

            await new Promise<void>((resolve) => setTimeout(resolve, 0));
            TestBed.flushEffects();

            expect(loader).toHaveBeenCalledTimes(1);
        });

        it('should return full scoped key as fallback before scope is loaded', () => {
            const store = TestBed.inject(TranslationStore);

            store.ensureScope('my-scope', resolvedLoader(SCOPE_DATA));

            expect(store.translate('my-scope:label')()).toEqual('my-scope:label');
        });
    });

    describe('translate — key parsing', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [provideTranslation(resolvedLoader(GLOBAL_DATA))]
            });
        });

        it('should treat a key without ":" as global', async () => {
            const store = TestBed.inject(TranslationStore);

            await new Promise<void>((resolve) => setTimeout(resolve, 0));
            TestBed.flushEffects();

            expect(store.translate('title')()).toEqual('Hello World');
        });

        it('should split on the first ":" only', async () => {
            const data: TranslationData = { 'foo:bar': 'value' };
            const store = TestBed.inject(TranslationStore);

            store.ensureScope('scope', resolvedLoader(data));

            await new Promise<void>((resolve) => setTimeout(resolve, 0));
            TestBed.flushEffects();

            expect(store.translate('scope:foo:bar')()).toEqual('scope:foo:bar');
        });
    });

    describe('interpolation', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [
                    provideTranslation(),
                    { provide: TRANSLATION_LOADER, useValue: resolvedLoader(GLOBAL_DATA) }
                ]
            });
        });

        it('should replace {{ param }} placeholders', async () => {
            const store = TestBed.inject(TranslationStore);

            await new Promise<void>((resolve) => setTimeout(resolve, 0));
            TestBed.flushEffects();

            expect(store.translate('greeting', { name: 'Alice' })()).toEqual('Hello, Alice!');
        });

        it('should keep placeholder text for missing params', async () => {
            const store = TestBed.inject(TranslationStore);

            await new Promise<void>((resolve) => setTimeout(resolve, 0));
            TestBed.flushEffects();

            expect(store.translate('greeting', {})()).toEqual('Hello, name!');
        });

        it('should support numeric param values', async () => {
            const data: TranslationData = { count: 'Total: {{ n }}' };
            const store = TestBed.inject(TranslationStore);

            store.ensureScope('', resolvedLoader(data));

            await new Promise<void>((resolve) => setTimeout(resolve, 0));
            TestBed.flushEffects();

            expect(store.translate('count', { n: 42 })()).toEqual('Total: 42');
        });
    });

    describe('TRANSLATION_PARSER', () => {
        const DATA: TranslationData = { greeting: 'Hello, {name}!' };

        it('should use the default interpolationParser when no TRANSLATION_PARSER is provided', async () => {
            TestBed.configureTestingModule({
                providers: [
                    TranslationStore,
                    withLang(),
                    { provide: TRANSLATION_LOADER, useValue: resolvedLoader({ greeting: 'Hello, {{ name }}!' }) }
                ]
            });

            const store = TestBed.inject(TranslationStore);

            await new Promise<void>(resolve => setTimeout(resolve, 0));
            TestBed.flushEffects();

            expect(store.translate('greeting', { name: 'Jane' })()).toEqual('Hello, Jane!');
        });

        it('should use a custom parser when TRANSLATION_PARSER is provided', async () => {
            const customParser = jest.fn((_pattern: string, _lang: string) => 'custom result');

            TestBed.configureTestingModule({
                providers: [
                    TranslationStore,
                    withLang(),
                    { provide: TRANSLATION_LOADER, useValue: resolvedLoader(DATA) },
                    { provide: TRANSLATION_PARSER, useValue: customParser }
                ]
            });

            const store = TestBed.inject(TranslationStore);

            await new Promise<void>(resolve => setTimeout(resolve, 0));
            TestBed.flushEffects();

            expect(store.translate('greeting', { name: 'Jane' })()).toEqual('custom result');
            expect(customParser).toHaveBeenCalledWith('Hello, {name}!', 'en', { name: 'Jane' });
        });

        it('should pass the active language to the parser', async () => {
            const parserSpy = jest.fn((_pattern: string, _lang: string) => 'ok');

            TestBed.configureTestingModule({
                providers: [
                    TranslationStore,
                    withLang('de' as Language),
                    { provide: TRANSLATION_LOADER, useValue: resolvedLoader(DATA) },
                    { provide: TRANSLATION_PARSER, useValue: parserSpy }
                ]
            });

            const store = TestBed.inject(TranslationStore);

            await new Promise<void>(resolve => setTimeout(resolve, 0));
            TestBed.flushEffects();

            store.translate('greeting', { name: 'Welt' })();

            expect(parserSpy).toHaveBeenCalledWith(expect.any(String), 'de', { name: 'Welt' });
        });

        it('should not call the parser when no params are given', async () => {
            const parserSpy = jest.fn();

            TestBed.configureTestingModule({
                providers: [
                    TranslationStore,
                    withLang(),
                    { provide: TRANSLATION_LOADER, useValue: resolvedLoader(DATA) },
                    { provide: TRANSLATION_PARSER, useValue: parserSpy }
                ]
            });

            const store = TestBed.inject(TranslationStore);

            await new Promise<void>(resolve => setTimeout(resolve, 0));
            TestBed.flushEffects();

            store.translate('greeting')();

            expect(parserSpy).not.toHaveBeenCalled();
        });
    });

    describe('language switching', () => {
        it('should reload translations when the language changes', async () => {
            const enData: TranslationData = { hello: 'Hello' };
            const deData: TranslationData = { hello: 'Hallo' };
            const loader = jest.fn((l: string) => Promise.resolve(l === 'de' ? deData : enData));

            TestBed.configureTestingModule({
                providers: [provideTranslation(), { provide: TRANSLATION_LOADER, useValue: loader }]
            });

            const store = TestBed.inject(TranslationStore);

            await new Promise<void>((resolve) => setTimeout(resolve, 0));
            TestBed.flushEffects();
            expect(store.translate('hello')()).toEqual('Hello');

            store.language.set('de' as Language);

            await new Promise<void>((resolve) => setTimeout(resolve, 0));
            TestBed.flushEffects();
            expect(store.translate('hello')()).toEqual('Hallo');
        });
    });
});
