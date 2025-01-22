import pino from "pino";
import { ChatServer } from "./chat-server";
import CommandService from "./command-service";
import ChatRepo, { ChatSession } from "./repositories/chat-repo";
import { MongoClient, Collection } from "mongodb";

// config, consider to use env variables in the future
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = "math-chat";
const collectionName = "chat-session";

async function getMongoCollection(uri: string, dbName: string, collectionName: string): Promise<Collection<ChatSession>> {
    const mongoClient = new MongoClient(uri);
    await mongoClient.connect();
    const db = mongoClient.db(dbName);
    const collection = db.collection<ChatSession>(collectionName);
    return collection;
}

async function main() {
    const logger = pino();
    const collection = await getMongoCollection(uri, dbName, collectionName);
    const commandService = new CommandService(logger, new ChatRepo(collection));
    const chatServer = new ChatServer(logger, commandService, 3000);
    chatServer.listen();
}

main();