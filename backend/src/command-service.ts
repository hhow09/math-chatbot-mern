import { Logger } from "pino";
import { evaluate as evaluateMathjs } from 'mathjs';
import { CommandAndResult } from "./entities/command-result.entity";

interface IRepository {
    saveCommand(clientId: string, command: string, result: string): void;
    getLatest(clientId: string, count: number): CommandAndResult[];
}

const historyCount = 10;

class CommandService {
    private operators = new Set(['+', '-', '*', '/']);
    private repository: IRepository;
    private logger: Logger;
    constructor(logger: Logger, repository: IRepository) {
        this.logger = logger;
        this.repository = repository;
    }

    // evaluateAndSave evaluates a mathematical expression and saves the result to the repository
    public evaluateAndSave(clientId: string, expression: string): string {
        const result = this.evaluate(expression);
        this.repository.saveCommand(clientId, expression, result);
        return result;
    }
    
    // getHistory returns the latest 10 commands for a client
    public getHistory(clientId: string): CommandAndResult[] {
        return this.repository.getLatest(clientId, historyCount);
    }

    // evaluate evaluate a mathematical expression
    private evaluate(expression: string): string {
        if (!this.isValidCommand(expression)) {
            throw new Error('Invalid command');
        }
        return evaluateMathjs(expression).toString();
    }

    // isValidCommand checks if the command is valid
    private isValidCommand(s: string): boolean {
        s = s.replace(/ /g,''); // remove all spaces
        if (s.length === 0) {
            return false;
        }
        // allowed characters: 0-9, +, -, *, /, .
        const regex = /^[\d+\-*/.]+$/;
        if (!regex.test(s)) {
            return false;
        }
        // operators cannot be adjacent to each other
        for (let i = 0; i < s.length - 1; i++) {
            if (this.operators.has(s[i]) && this.operators.has(s[i + 1])) {
                return false;
            }
        }
    
        // operators cannot be at the beginning or end of the string
        if (this.operators.has(s[0]) || this.operators.has(s[s.length - 1])) {
            return false;
        }
        return true;
    }
}

export default CommandService;