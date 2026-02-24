import { interpolationParser } from './interpolation.parser';

describe('interpolationParser', () => {
    describe('without params', () => {
        it('should return the pattern unchanged', () => {
            expect(interpolationParser('Hello, {{ name }}!', 'en')).toEqual('Hello, {{ name }}!');
        });

        it('should return a plain string unchanged', () => {
            expect(interpolationParser('Hello World', 'en')).toEqual('Hello World');
        });
    });

    describe('with params', () => {
        it('should replace a single {{ placeholder }}', () => {
            expect(interpolationParser('Hello, {{ name }}!', 'en', { name: 'Jane' })).toEqual('Hello, Jane!');
        });

        it('should replace multiple placeholders', () => {
            expect(interpolationParser('{{ greeting }}, {{ name }}!', 'en', { greeting: 'Hi', name: 'Jane' })).toEqual(
                'Hi, Jane!'
            );
        });

        it('should support numeric values', () => {
            expect(interpolationParser('Count: {{ n }}', 'en', { n: 42 })).toEqual('Count: 42');
        });

        it('should ignore whitespace inside the braces', () => {
            expect(interpolationParser('{{name}} and {{ name }}', 'en', { name: 'Jane' })).toEqual('Jane and Jane');
        });

        it('should fall back to the placeholder name for a missing param', () => {
            expect(interpolationParser('Hello, {{ name }}!', 'en', {})).toEqual('Hello, name!');
        });

        it('should not modify the string when params is an empty object and there are no placeholders', () => {
            expect(interpolationParser('Hello World', 'en', {})).toEqual('Hello World');
        });

        it('should not be affected by the lang argument', () => {
            const result = interpolationParser('{{ x }}', 'de', { x: 'Welt' });

            expect(result).toEqual('Welt');
        });
    });
});
