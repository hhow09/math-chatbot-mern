import express, { Request, Response } from 'express';
import { Logger } from "pino";
import { Server, Socket } from "socket.io";
import { ICommandService } from './command-service';

export class ChatServer {
    port: number;
    app: express.Application;
    logger: Logger;
    commandService: ICommandService;

    constructor(logger: Logger, commandService: ICommandService, port: number = 3000) {
        this.port = port;
        this.logger = logger;
        this.app = express();
        this.setupAppRoutes();
        this.commandService = commandService;
    }
    private setupAppRoutes() {
        // health check
        // ref: https://kubernetes.io/docs/reference/using-api/health-checks/
        this.app.get('/livez', (req: Request, res: Response) => {
            res.send('OK');
        });
    }

    private setupSocketHandler(io: Server) {
        io.on('connection', (socket: Socket) => {
            const sessionLogger = this.logger.child({ session: socket.id });
            sessionLogger.info(`Connected client session ${socket.id} on port ${this.port}`);
            socket.on('operation', async (operation: string) => {
                sessionLogger.info(`Received operation: ${operation}`);
                try {
                    const result = await this.commandService.evaluateAndSave(socket.id, operation);
                    sessionLogger.info(`Returning result: ${result}`);
                    socket.emit('result', result);
                } catch (error) {
                    this.handleSocketError(socket, sessionLogger, "operation", error as Error);
                }
            });
            socket.on('history', async () => {
                try {
                    const history = await this.commandService.getHistory(socket.id);
                    sessionLogger.info(`Returning history: ${JSON.stringify(history)}`);
                    socket.emit('history', history);
                } catch (error) {
                    this.handleSocketError(socket, sessionLogger, "history", error as Error);
                }
            });
            socket.on('disconnect', () => {
                sessionLogger.info('a client disconnected');
            });
        });
    }

    private handleSocketError(socket: Socket, logger: Logger, operation: string, error: Error) {
        logger.error(`Error during operation: ${operation}`, error);
        socket.emit('error', error instanceof Error ? error.message : String(error));
    }

    public listen() {
        const httpServer = this.app.listen(this.port,
            () => { this.logger.info(`Server listening on port ${this.port}`) }
        );
        
        // Express server and socket.io server is sharing the same http server
        const io = new Server(httpServer, {
            cors: {
                origin: '*',
            }
        });
        this.setupSocketHandler(io);
        return async function close() {
            httpServer.close();
            await io.close();
        }
    }
}

