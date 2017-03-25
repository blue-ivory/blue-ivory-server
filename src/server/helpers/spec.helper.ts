import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

var config = require('./../../config');

global.Promise = Promise;
Promise.promisifyAll(mongoose);
(<any>mongoose).Promise = Promise;

before(done => {
    mongoose.connect(config.db.test.url);
    
    for (let i in mongoose.connection.collections) {
        mongoose.connection.collections[i].remove(function () { });
    }

    done();
});

beforeEach(done => {

    for (let i in mongoose.connection.collections) {
        mongoose.connection.collections[i].remove(function () { });
    }

    done();
});

after(done => {
    mongoose.disconnect();

    done();
});