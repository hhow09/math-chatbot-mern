import express, { Request, Response } from 'express';
import { Logger } from "pino";
import { Server, Socket } from "socket.io";

export class ChatServer {
    port: number;
    app: express.Application;
    logger: Logger;

    constructor(logger: Logger, port: number = 3000) {
        this.port = port;
        this.logger = logger;
        this.app = express();
        this.setupAppRoutes();
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
            socket.on('disconnect', () => {
                sessionLogger.info('a client disconnected');
            });
        });
    }

    public listen() {
        const httpServer = this.app.listen(this.port,
            () => { console.log(`Server listening on port ${this.port}`) }
        );
        
        // Express server and socket.io server is sharing the same http server
        const io = new Server(httpServer, {
            cors: {
                origin: '*',
            }
        });
        this.setupSocketHandler(io);
    }
}
