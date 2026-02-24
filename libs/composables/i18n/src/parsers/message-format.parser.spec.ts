import { MessageFormatLike, withMessageFormat } from './message-format.parser';

// ---------------------------------------------------------------------------
// Minimal mock of a MessageFormat-compatible constructor.
// Each compile() call returns a function that replaces {key} with params[key].
// ---------------------------------------------------------------------------
class MockMessageFormat {
    constructor(public readonly locale: string) {}

    compile(pattern: string) {
        return (params: Record<string, unknown> = {}) =>
            pattern.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? key));
    }
}

const MF = MockMessageFormat as unknown as MessageFormatLike;

describe('withMessageFormat', () => {
    it('should return a TranslationParser function', () => {
        expect(typeof withMessageFormat(MF)).toEqual('function');
    });

    describe('formatting', () => {
        it('should format a simple {name} pattern', () => {
            const parser = withMessageFormat(MF);

            expect(parser('Hello, {name}!', 'en', { name: 'Jane' })).toEqual('Hello, Jane!');
        });

        it('should support numeric params', () => {
            const parser = withMessageFormat(MF);

            expect(parser('Count: {n}', 'en', { n: 42 })).toEqual('Count: 42');
        });

        it('should fall back to the placeholder name for a missing param', () => {
            const parser = withMessageFormat(MF);

            expect(parser('Hello, {name}!', 'en', {})).toEqual('Hello, name!');
        });

        it('should return the pattern unchanged when params is undefined', () => {
            const parser = withMessageFormat(MF);

            // compile({}) returns the pattern because there are no params
            expect(parser('Hello World', 'en', undefined)).toEqual('Hello World');
        });
    });

    describe('caching', () => {
        it('should compile each pattern only once per language', () => {
            const compileSpy = jest.fn((pattern: string) => (_: object) => pattern);
            const SpyMF = jest.fn().mockImplementation(() => ({ compile: compileSpy })) as unknown as MessageFormatLike;
            const parser = withMessageFormat(SpyMF);

            parser('Hello, {name}!', 'en', { name: 'A' });
            parser('Hello, {name}!', 'en', { name: 'B' });

            expect(compileSpy).toHaveBeenCalledTimes(1);
        });

        it('should compile the same pattern separately for each language', () => {
            const compileSpy = jest.fn((pattern: string) => (_: object) => pattern);
            const SpyMF = jest.fn().mockImplementation(() => ({ compile: compileSpy })) as unknown as MessageFormatLike;
            const parser = withMessageFormat(SpyMF);

            parser('Hello', 'en', {});
            parser('Hello', 'de', {});

            expect(compileSpy).toHaveBeenCalledTimes(2);
        });

        it('should create one MessageFormat instance per language', () => {
            const SpyMF = jest
                .fn()
                .mockImplementation(() => ({ compile: () => () => '' })) as unknown as MessageFormatLike;
            const parser = withMessageFormat(SpyMF);

            parser('a', 'en', {});
            parser('b', 'en', {});
            parser('a', 'de', {});

            expect(SpyMF).toHaveBeenCalledTimes(2);
            expect(SpyMF).toHaveBeenCalledWith('en');
            expect(SpyMF).toHaveBeenCalledWith('de');
        });
    });

    describe('isolation', () => {
        it('should keep separate caches between different withMessageFormat() calls', () => {
            const compileSpy = jest.fn((pattern: string) => (_: object) => pattern);
            const SpyMF = jest.fn().mockImplementation(() => ({ compile: compileSpy })) as unknown as MessageFormatLike;

            const parserA = withMessageFormat(SpyMF);
            const parserB = withMessageFormat(SpyMF);

            parserA('Hello', 'en', {});
            parserB('Hello', 'en', {});

            // Each parser has its own cache, so compile is called once per parser
            expect(compileSpy).toHaveBeenCalledTimes(2);
        });
    });
});
