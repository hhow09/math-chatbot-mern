import pino from "pino";
import { ChatServer } from "./chat-server";
import CommandService from "./command-service";
import ChatRepo, { ChatSession } from "./repositories/chat-repo";
import { MongoClient, Collection } from "mongodb";

// config, consider to use env variables in the future
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = "math-chat";
const collectionName = "chat-session";

async function getMongoCollection(mongoClient: MongoClient, dbName: string, collectionName: string): Promise<Collection<ChatSession>> {
    const db = mongoClient.db(dbName);
    const collection = db.collection<ChatSession>(collectionName);
    return collection;
}
function connectMongo(uri: string): Promise<MongoClient> {
    return new MongoClient(uri).connect();
}

async function main() {
    // setup connection
    // fail first if connection fail
    const mongoClient = await connectMongo(uri);

    // construct component
    const logger = pino();
    const collection = await getMongoCollection(mongoClient, dbName, collectionName);
    const commandService = new CommandService(logger, new ChatRepo(collection));
    const chatServer = new ChatServer(logger, commandService, 3000);
    const serverClose = chatServer.listen();

    // graceful shutdown
    const shutdown = async () => {
        await serverClose();
        await mongoClient.close();
    }
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
}

main();