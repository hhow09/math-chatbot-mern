import { CommandAndResult } from "../entities/command-result.entity";
import ChatRepo from "./chat-repo";

interface IRepository {
    saveCommand(clientId: string, command: string, result: string): Promise<void>;
    getLatest(clientId: string): Promise<CommandAndResult[]>;
}

export { ChatRepo, IRepository };