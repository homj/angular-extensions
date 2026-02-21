import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { useTranslation } from './use-translation.composable';
import { TranslationStore } from '../service/translation.store';
import { provideTranslationScope } from '../providers/translation.providers';
import { TRANSLATION_SCOPE } from '../tokens/translation.tokens';
import { TranslationData } from '../models/translation.types';

const GLOBAL_DATA: TranslationData = { title: 'Hello World' };
const SCOPE_DATA: TranslationData = { description: 'Component description' };

const mockStore = (overrides: Partial<TranslationStore> = {}): TranslationStore =>
    ({
        ensureScope: jest.fn(),
        translate: jest.fn((key: string) => key),
        isLoading: jest.fn(),
        ...overrides
    }) as unknown as TranslationStore;

describe('useTranslation', () => {
    it('should return a function', () => {
        TestBed.configureTestingModule({
            providers: [{ provide: TranslationStore, useValue: mockStore() }]
        });

        TestBed.runInInjectionContext(() => {
            const t = useTranslation();

            expect(typeof t).toEqual('function');
        });
    });

    it('should delegate to store.translate', () => {
        const translateSpy = jest.fn().mockReturnValue('translated value');
        TestBed.configureTestingModule({
            providers: [{ provide: TranslationStore, useValue: mockStore({ translate: translateSpy }) }]
        });

        TestBed.runInInjectionContext(() => {
            const t = useTranslation();
            const result = t('title');

            expect(translateSpy).toHaveBeenCalledWith('title', undefined);
            expect(result).toEqual('translated value');
        });
    });

    it('should forward params to store.translate', () => {
        const translateSpy = jest.fn().mockReturnValue('Hello, Jane!');
        TestBed.configureTestingModule({
            providers: [{ provide: TranslationStore, useValue: mockStore({ translate: translateSpy }) }]
        });

        TestBed.runInInjectionContext(() => {
            const t = useTranslation();

            t('greeting', { name: 'Jane' });

            expect(translateSpy).toHaveBeenCalledWith('greeting', { name: 'Jane' });
        });
    });

    it('should register scope loaders from TRANSLATION_SCOPE token', () => {
        const ensureScopeSpy = jest.fn();
        const loader = jest.fn().mockResolvedValue(SCOPE_DATA);

        TestBed.configureTestingModule({
            providers: [
                { provide: TranslationStore, useValue: mockStore({ ensureScope: ensureScopeSpy }) },
                { provide: TRANSLATION_SCOPE, useValue: { scope: 'my-comp', loader }, multi: true }
            ]
        });

        TestBed.runInInjectionContext(() => {
            useTranslation();

            expect(ensureScopeSpy).toHaveBeenCalledWith('my-comp', loader);
        });
    });

    it('should register multiple scope loaders', () => {
        const ensureScopeSpy = jest.fn();
        const loaderA = jest.fn().mockResolvedValue({});
        const loaderB = jest.fn().mockResolvedValue({});

        TestBed.configureTestingModule({
            providers: [
                { provide: TranslationStore, useValue: mockStore({ ensureScope: ensureScopeSpy }) },
                { provide: TRANSLATION_SCOPE, useValue: { scope: 'scope-a', loader: loaderA }, multi: true },
                { provide: TRANSLATION_SCOPE, useValue: { scope: 'scope-b', loader: loaderB }, multi: true }
            ]
        });

        TestBed.runInInjectionContext(() => {
            useTranslation();

            expect(ensureScopeSpy).toHaveBeenCalledWith('scope-a', loaderA);
            expect(ensureScopeSpy).toHaveBeenCalledWith('scope-b', loaderB);
        });
    });

    it('should work without any TRANSLATION_SCOPE providers', () => {
        const ensureScopeSpy = jest.fn();
        TestBed.configureTestingModule({
            providers: [{ provide: TranslationStore, useValue: mockStore({ ensureScope: ensureScopeSpy }) }]
        });

        TestBed.runInInjectionContext(() => {
            useTranslation();

            expect(ensureScopeSpy).not.toHaveBeenCalled();
        });
    });

    describe('integration — global translations', () => {
        @Component({
            template: `<p id="title">{{ t('title') }}</p>`,
            standalone: true
        })
        class TestComponent {
            t = useTranslation();
        }

        let fixture: ComponentFixture<TestComponent>;

        beforeEach(async () => {
            await TestBed.configureTestingModule({
                imports: [TestComponent],
                providers: [
                    {
                        provide: TranslationStore,
                        useValue: mockStore({ translate: (key: string) => GLOBAL_DATA[key] ?? key })
                    }
                ]
            }).compileComponents();

            fixture = TestBed.createComponent(TestComponent);
            fixture.detectChanges();
        });

        it('should render the translated value in the template', () => {
            const p = fixture.nativeElement.querySelector('#title');

            expect(p.textContent).toEqual('Hello World');
        });

        it('should render the key as fallback for missing translations', () => {
            const t = fixture.componentInstance.t;

            expect(t('missing')).toEqual('missing');
        });
    });

    describe('integration — scoped translations via provideTranslationScope', () => {
        @Component({
            template: `<p id="desc">{{ t('my-scope:description') }}</p>`,
            standalone: true,
            providers: [provideTranslationScope('my-scope', () => Promise.resolve(SCOPE_DATA))]
        })
        class ScopedComponent {
            t = useTranslation();
        }

        let fixture: ComponentFixture<ScopedComponent>;

        beforeEach(async () => {
            const ensureScopeSpy = jest.fn();
            const translateSpy = jest.fn((key: string) => {
                if (key === 'my-scope:description') return 'Component description';
                return key;
            });

            await TestBed.configureTestingModule({
                imports: [ScopedComponent],
                providers: [
                    {
                        provide: TranslationStore,
                        useValue: mockStore({ ensureScope: ensureScopeSpy, translate: translateSpy })
                    }
                ]
            }).compileComponents();

            fixture = TestBed.createComponent(ScopedComponent);
            fixture.detectChanges();
        });

        it('should render the scoped translation in the template', () => {
            const p = fixture.nativeElement.querySelector('#desc');

            expect(p.textContent).toEqual('Component description');
        });
    });
});
