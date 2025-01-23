import { evaluate } from './evaluate';

type TestCase = {
    command: string;
    expected?: string;
    hasError?: boolean;
};

describe('evaluate', () => {
    describe.each<TestCase>([
        { command: '', hasError: true },
        { command: ' ', hasError: true },
        { command: '1+', hasError: true },
        { command: '1 */ 2', hasError: true },
        { command: '2 + + 1', hasError: true },
        { command: '1a2b3c', hasError: true },
        { command: '1 + 2 = 3', hasError: true },
        { command: '(123 * 23) + 45 - 6', hasError: true },

        // // does not support negative numbers in expression
        { command: '5 * -3', hasError: true },

        // // basic
        { command: '1', expected: '1' },
        { command: '1 + 1', expected: '2' },
        { command: '123 * 23 + 45 - 6', expected: '2868' },
        { command: '1 + 259 - 68*77', expected: '-4976' },
        { command: '10 * 5 / 2', expected: '25' },
        { command: '10.5 * 5 / 2.5', expected: '21' },
        { command: '.5 + 1', expected: '1.5' },

        // negative sign at the beginning
        { command: '-1', expected: '-1' },
        { command: '-1 + 1', expected: '0' },
        { command: '-5*3 + 1', expected: '-14' },
        // Zero cases
        { command: '0 * 5', expected: '0' },
        { command: '0 / 1', expected: '0' },
        { command: '1 / 0', expected: 'Infinity' },
        { command: '0 / 0', expected: 'NaN' },

        // decimal default precision is 20.
        // ref: https://mikemcl.github.io/decimal.js/#precision
        { command: '10.54 * 7 / 3', expected: '24.593333333333333333' }, 
        { command: '5 * 7 / 3 * 3', expected: '35' },
        { command: '1 + 2 * 3 / 4', expected: '2.5' },

        // test edge cases
        { command: '999999999999 * 999999999999', expected: '9.99999999998e+23' },

    ])('.evaluate($command)', ({ command, hasError, expected }) => {
        test(`returns ${hasError}`, () => {
            if (hasError) {
                expect(() => evaluate(command)).toThrow('Invalid command');
            } else {
                const res = evaluate(command);
                expect(res).toBe(expected);
            }
        });
    });
});