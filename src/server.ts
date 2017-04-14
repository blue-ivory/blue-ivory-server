import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as morgan from 'morgan';
import * as methodOverride from 'method-override';
import * as Bluebird from 'bluebird';
import * as mongoose from 'mongoose';
import * as requestRouter from './request/request.router';
import * as permissionRouter from './permission/permission.router';
import * as visitorRouter from './visitor/visitor.router';
import * as organizationRouter from './organization/organization.router';
import * as userRouter from './user/user.router';
import * as SocketIO from 'socket.io';
import * as http from 'http';
import { Socket } from "./helpers/socket.handler";
var config = require('./../config');

global.Promise = Bluebird;
Bluebird.promisifyAll(mongoose);
(<any>mongoose).Promise = Bluebird;

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
        this.initializeRoutes();
        this.createServer();
        this.listen();
        this.initializeSocket();
    }

    private createApplication() {
        this.app = express();
    }

    private initializeRoutes() {
        this.app.use('/api/', requestRouter);
        this.app.use('/api/', visitorRouter);
        this.app.use('/api/', userRouter);
        this.app.use('/api/', permissionRouter);
        this.app.use('/api/', organizationRouter);
    }

    private initializeHeaders() {
        this.app.use(function (req, res, next) {

            // Website you wish to allow to connect
            res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

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
        mongoose.connect(config.db.prod.url);
    }

    private config() {
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
        this.app.use(methodOverride());
        this.app.use(morgan('dev'));
        this.port = process.env.PORT || Server.PORT;
    }

    private listen() {
        this.server.listen(this.port, () => {
            console.log(`Application running on port ${this.port}`);
        });
    }

    private initializeSocket() {
        this.socket = new Socket(this.server);
    }
}

export let server = Server.bootstrap();
