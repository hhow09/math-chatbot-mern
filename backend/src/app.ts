import pino from "pino";
import { ChatServer } from "./chat-server";

const logger = pino();
const chatServer = new ChatServer(logger, 3000);
chatServer.listen();
