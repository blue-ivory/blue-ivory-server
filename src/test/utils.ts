/// <reference path="../../typings/index.d.ts" />
'use strict';

var config = require('./../../config');
import * as mongoose from 'mongoose';
//var mongoose = require('mongoose');

beforeEach((done) => {
    function clearDB() {

        for (let i in mongoose.connection.collections) {
            mongoose.connection.collections[i].remove(function () { });
        }

        return done();
    }

    if (mongoose.connection.readyState === 0) {
        mongoose.connect(config.db.test.url, function (err) {
            if (err) {
                throw err;
            }
            return clearDB();
        });
    } else {
        return clearDB();
    }
});

afterEach(function (done) {
    mongoose.disconnect();

    return done();
})