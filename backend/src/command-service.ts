import { Logger } from "pino";
import { CommandAndResult } from "./entities/command-result.entity";
import { IRepository } from "./repositories";
import { isValidCommand, evaluate } from "./math/evaluate";

export interface ICommandService {
    evaluateAndSave(clientId: string, expression: string): Promise<string>;
    getHistory(clientId: string): Promise<CommandAndResult[]>;
}

class CommandService implements ICommandService {
    private repository: IRepository;
    private logger: Logger;
    constructor(logger: Logger, repository: IRepository) {
        this.logger = logger;
        this.repository = repository;
    }

    // evaluateAndSave evaluates a mathematical expression and saves the result to the repository
    public async evaluateAndSave(clientId: string, expression: string): Promise<string> {
        const result = this.evaluate(expression);
        await this.repository.saveCommand(clientId, expression, result);
        return result;
    }
    
    // getHistory returns the latest 10 commands for a client
    public async getHistory(clientId: string): Promise<CommandAndResult[]> {
        return this.repository.getLatest(clientId);
    }

    // evaluate evaluate a mathematical expression
    private evaluate(expression: string): string {
        if (!isValidCommand(expression)) {
            throw new Error('Invalid command');
        }
        return evaluate(expression);
    }
}

export default CommandService;