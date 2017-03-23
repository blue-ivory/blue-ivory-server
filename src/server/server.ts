import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as morgan from 'morgan';
import * as methodOverride from 'method-override';
import * as Promise from 'bluebird';
import * as mongoose from 'mongoose';
import * as requestRouter from './controllers/request.controller';
import * as userRouter from './controllers/user.controller';
import * as organizationRouter from './controllers/organization.controller';
import * as permissionRouter from './controllers/permission.controller';
import * as visitorRouter from './controllers/visitor.controller';



var config = require('./../../config');
const app: express.Application = express();

Promise.promisifyAll(mongoose);
(<any>mongoose).Promise = Promise;

mongoose.connect(config.db.prod.url);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());
app.use(morgan('dev'));

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Pass to next layer of middleware
    next();
});

const port: number = 80;

app.use('/api/', requestRouter.default);
app.use('/api/', userRouter.default);
app.use('/api/', organizationRouter.default);
app.use('/api/', permissionRouter.default);
app.use('/api/', visitorRouter.default);


var server = app.listen(port, () => {
    console.log('Application is running port %s', port);
});
