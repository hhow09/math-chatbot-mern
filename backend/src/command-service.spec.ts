import CommandService from './command-service';
import { pino } from 'pino';

const mockRepository = {
    saveCommand: jest.fn(),
    getLatest: jest.fn(),
};

type TestCase = {
    command: string;
    expected?: string;
    hasError?: boolean;
};

describe('evaluate', () => {
    const logger = pino();
    describe.each<TestCase>([
        { command: '', hasError: true },
        { command: ' ', hasError: true },
        { command: '1', expected: '1' },
        { command: '1+', hasError: true },
        { command: '2 + + 1', hasError: true },

        { command: '1 + 1', expected: '2' },
        { command: '123 * 23 + 45 - 6', expected: '2868' },
        { command: '10 * 5 / 2', expected: '25' },
        { command: '10.5 * 5 / 2.5', expected: '21' },

        { command: '1a2b3c', hasError: true },
        { command: '1 + 2 = 3', hasError: true },
        { command: '(123 * 23) + 45 - 6', hasError: true },

        { command: '1 + 1', expected: '2' },
        { command: '123 * 23 + 45 - 6', expected: '2868' },
        { command: '10 * 5 / 2', expected: '25' },
        { command: '10.54 * 7 / 3', expected: '24.593333333333334' },
        { command: '5 * 7 / 3 * 3', expected: '35' },

    ])('.evaluate($command)', ({ command, hasError, expected }) => {
        test(`returns ${hasError}`, async () => {
            const clientId = 'whatever';
            const commandService = new CommandService(logger, mockRepository);
            if (hasError) {
                await expect(commandService.evaluateAndSave(clientId, command)).rejects.toThrow('Invalid command');
            } else {
                const res = await commandService.evaluateAndSave(clientId, command);
                expect(res).toBe(expected);
                expect(mockRepository.saveCommand).toHaveBeenCalledWith(clientId, command, expected);
            }
        });
    });
});