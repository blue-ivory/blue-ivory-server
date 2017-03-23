"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const methodOverride = require("method-override");
const Promise = require("bluebird");
const mongoose = require("mongoose");
const requestRouter = require("./controllers/request.controller");
const userRouter = require("./controllers/user.controller");
const organizationRouter = require("./controllers/organization.controller");
const permissionRouter = require("./controllers/permission.controller");
const visitorRouter = require("./controllers/visitor.controller");
var config = require('./../../config');
const app = express();
Promise.promisifyAll(mongoose);
mongoose.Promise = Promise;
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
const port = 80;
app.use('/api/', requestRouter);
app.use('/api/', userRouter);
app.use('/api/', organizationRouter);
app.use('/api/', permissionRouter);
app.use('/api/', visitorRouter);
var server = app.listen(port, () => {
    console.log('Application is running port %s', port);
});
