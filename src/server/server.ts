/// <reference path="./../../typings/index.d.ts" />

import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as morgan from 'morgan';
import * as methodOverride from 'method-override';
import * as mongoose from 'mongoose';
import * as bluebird from 'bluebird';
import * as requestRouter from './controllers/request.controller';
import * as userRouter from './controllers/user.controller';
import * as baseRouter from './controllers/base.controller';


var config = require('./../../config');
const app: express.Application = express();

bluebird.promisifyAll(mongoose);

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

app.use('/api/', requestRouter);
app.use('/api/', userRouter);
app.use('/api/', baseRouter);

var server = app.listen(port, () => {
    console.log('Application is running port %s', port);
});
