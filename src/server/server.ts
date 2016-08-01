/// <reference path="./../../typings/index.d.ts" />

import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as morgan from 'morgan';
import * as methodOverride from 'method-override';
import * as mongoose from 'mongoose';
import * as requestsRouter from './controllers/requests.controller'; 

const app: express.Application = express();

mongoose.connect('mongodb://localhost/blue-ivory-2');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(morgan('dev'));

const port: number = 80;

app.use('/api/request', requestsRouter);

var server = app.listen(port, () => {
    console.log('Application is running port %s', port);
});
