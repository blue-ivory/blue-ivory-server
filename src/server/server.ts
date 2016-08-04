/// <reference path="./../../typings/index.d.ts" />

import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as morgan from 'morgan';
import * as methodOverride from 'method-override';
import * as mongoose from 'mongoose';
import * as requestRouter from './controllers/request.controller';
import * as userRouter from './controllers/user.controller';  

const app: express.Application = express();

mongoose.connect('mongodb://localhost/blue-ivory-2');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json'}));
app.use(methodOverride());
app.use(morgan('dev'));

const port: number = 80;

app.use('/api/', requestRouter);
app.use('/api/', userRouter);

var server = app.listen(port, () => {
    console.log('Application is running port %s', port);
});
