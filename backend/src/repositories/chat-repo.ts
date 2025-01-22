import { Collection } from "mongodb";
import { CommandAndResult } from "../entities/command-result.entity";
import { IRepository } from "./";

// ChatSession represents a chat session
export class ChatSession {
    // clientId is the id of the client (a.k.a. socket.id)
    clientId: string;
    // history is a list of commands and corresponding results
    history: CommandAndResult[];
    constructor(clientId: string) {
        this.clientId = clientId;
        this.history = [];
    }
}

// ChatRepo is a repository for storing chat sessions
class ChatRepo implements IRepository {
    private db_client: Collection<ChatSession>; // connected db client
    private latestCount: number;
    constructor(db_client: Collection<ChatSession>, latestCount: number = 10) {
        this.db_client = db_client;
        this.latestCount = latestCount;
        this.ensureIndex();
    }
    private async ensureIndex(): Promise<void> {
        // create a unique index on clientId because it will query by clientId
        await this.db_client.createIndex({ clientId: 1 }, { unique: true });
    }

    // saveCommand saves a command and its result to the chat session
    public async saveCommand(clientId: string, command: string, result: string): Promise<void> {
        const history: CommandAndResult = {
            expression: command,
            result: result
        }
        await this.db_client.updateOne(
            { clientId }, 
            // use slice to only keep the latest CommandAndResult
            // ref: https://www.mongodb.com/docs/manual/reference/operator/update/slice/
            { $push: { history: { $each: [history], $slice: -this.latestCount } } }, 
            { upsert: true }
        );
    }
    
    public async getLatest(clientId: string): Promise<CommandAndResult[]> {
        const chatSession = await this.db_client.findOne({ clientId });
        if (!chatSession) {
            return [];
        }
        return chatSession.history;
    }
}

export default ChatRepo;