import { Collection } from "mongodb";
import { MongoClient } from "mongodb";
import ChatRepo, {ChatSession} from "./chat-repo";
import { CommandAndResult } from "../entities/command-result.entity";

describe("ChatRepo", () => {
    let testCollection: Collection<ChatSession>;
    let repo: ChatRepo;
    let client: MongoClient;
    const clientId = "123";
    const clientId2 = "456";

    beforeAll(async () => {
        const uri: string = process.env.MONGODB_URI || "mongodb://localhost:27017";
        client = new MongoClient(uri);
        await client.connect();
        testCollection = client.db("test").collection<ChatSession>("chat-sessions");
        repo = new ChatRepo(testCollection);
    });

    beforeEach(async () => {
        await testCollection.deleteMany({}); // delete all data but keep the index
    });

    afterAll(async () => {
        await client.close();
    });

    it("should be successful", async () => {
        const expected: CommandAndResult[] = [{ expression: "1+4", result: "5" }, { expression: "1+2", result: "3" }];
        for (const command of expected) {
            await repo.saveCommand(clientId, command.expression, command.result);
        }
        const history = await repo.getLatest(clientId);
        expect(history).toEqual(expected);

        await repo.saveCommand(clientId2, expected[1].expression, expected[1].result);
        const history2 = await repo.getLatest(clientId2);
        expect(history2).toEqual([expected[1]]);
    });

    it("should throw an error if the chat session is not found", async () => {
        await expect(repo.getLatest(clientId)).rejects.toThrow("Chat session not found");
    });
    

    it("should save the latest 10 commands and results", async () => {
        const chatHistory: CommandAndResult[] = new Array(20).fill(0).map((_, index) => ({ expression: `1+${index}`, result: `${index}` }));
        for (const command of chatHistory) {
            await repo.saveCommand(clientId, command.expression, command.result);
        }
        const expected = chatHistory.slice(-10);
        const history = await repo.getLatest(clientId);
        expect(history).toEqual(expected); // the latest 10 commands and results
    });
});
