import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as http from 'http';
import * as methodOverride from 'method-override';
import * as mongoose from 'mongoose';
import * as morgan from 'morgan';
import * as path from 'path';
import { AuthenticationHandler } from "./auth/auth.handler";
import { config } from './config';
import { Socket } from "./helpers/socket.handler";
import * as organizationRouter from './organization/organization.router';
import * as permissionRouter from './permission/permission.router';
import commentsRouter from './request/comments/comment.router';
import requestRouter from './request/request.router';
import userRouter from './user/user.router';
import visitorRouter from './visitor/visitor.router';

class Server {
    public static readonly PORT = 80;
    public app: express.Application;
    private server: http.Server;
    private socket: Socket;
    private port: number;

    public static bootstrap(): Server {
        return new Server();
    }

    constructor() {
        this.connectDB();
        this.createApplication();
        this.initializeHeaders();
        this.config();
        this.createServer();
        AuthenticationHandler.init(this.app);
        this.listen();
        this.initializeSocket();
        this.initializeRoutes();
        this.configureLtmIsAlive();
    }

    private createApplication() {
        this.app = express();
    }

    private initializeRoutes() {
        this.app.use('/api/', requestRouter(this.socket));
        this.app.use('/api/', commentsRouter());
        this.app.use('/api/', visitorRouter(this.socket));
        this.app.use('/api/', userRouter(this.socket));
        this.app.use('/api/', permissionRouter);
        this.app.use('/api/', organizationRouter);
    }

    private initializeHeaders() {
        this.app.use(function (req, res, next) {

            let origin = req.headers.origin as string;

            if (config.client.allowedOrigins.indexOf(origin) > -1) {
                // Website you wish to allow to connect
                res.setHeader('Access-Control-Allow-Origin', origin);
            }

            res.setHeader('Access-Control-Allow-Credentials', 'true');

            // Request methods you wish to allow
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

            // Request headers you wish to allow
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

            // Pass to next layer of middleware
            next();
        });
    }

    private createServer() {
        this.server = http.createServer(this.app);
    }

    private connectDB() {
        mongoose.connect(`mongodb://${config.database.host}/${config.database.db}`, { useNewUrlParser: true });
    }

    private config() {
        this.app.set('view engine', 'ejs');
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
        this.app.use(methodOverride());
        this.app.use(morgan('dev'));
        this.app.use('/assets', express.static(path.join(__dirname, 'assets')))
        this.port = Server.PORT;
    }

    private listen() {
        this.server.listen(this.port, () => {
            console.log(`Application running on port ${this.port}`);
        });
    }

    private initializeSocket() {
        this.socket = new Socket(this.server);
    }

    private configureLtmIsAlive() {
        this.app.get('/isAlive', (req: express.Request, res: express.Response) => {
            return res.send('Server Is Up');
        });
        this.app.get('/server', (req: express.Request, res: express.Response) => {
            return res.send(config.server.host);
        });
    }
}

export let server = Server.bootstrap();
