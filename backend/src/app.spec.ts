import { ChatServer } from "./chat-server";
import CommandService from "./command-service";
import ChatRepo, { ChatSession } from "./repositories/chat-repo";
import { pino } from "pino";
import { io as ioc, type Socket as ClientSocket } from "socket.io-client";
import { MongoClient } from "mongodb";

describe("App Integration Test", () => {
    let chatServer: ChatServer;
    let mongoClient: MongoClient;
    let clientSocket: ClientSocket;
    let close: () => void;
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017";
    const serverPort = 3001;
    const serverUri = `http://localhost:${serverPort}`;
    
    beforeAll(async () => {
        const dbName = "test" + Date.now();
        const collectionName = "chat-session";
        const logger = pino();
        mongoClient = await new MongoClient(mongoUri).connect();
        logger.info("Connected to MongoDB");
        const db = mongoClient.db(dbName);
        const collection = db.collection<ChatSession>(collectionName);
        const commandService = new CommandService(logger, new ChatRepo(collection));
        chatServer = new ChatServer(logger, commandService, serverPort);
        close = chatServer.listen();
    });

    beforeEach(async () => {
        clientSocket = await ioc(serverUri).connect();
    });

    afterEach(async () => {
        await clientSocket.close();
    });

    afterAll(async () => {
        await close();
        await mongoClient.close();
    });

    it("should return result", (done: jest.DoneCallback) => {
        clientSocket.on("result", (arg) => {
            expect(arg).toBe("2");
            done();
        });
        clientSocket.emit("operation", "1+1");
    });
    it("should return error", (done: jest.DoneCallback) => {
        clientSocket.on("error", (arg) => {
            expect(arg).toBe("Invalid command");
            done();
        });
        clientSocket.emit("operation", "1--2");
    });
    it("should return history", (done: jest.DoneCallback) => {
        const expected = [{ expression: "1+1", result: "2" }, { expression: "2+3", result: "5" }];

        clientSocket.on("result", (arg) => {
            if (arg===expected[expected.length-1].result) {
                clientSocket.emit("history");
            }
        });
        clientSocket.on("history", (arg) => {
            expect(arg).toEqual(expected);
            done();
        });

        clientSocket.emit("operation", "1+1"); // step 1
        clientSocket.emit("operation", "2+3"); // step 2
    });
});
