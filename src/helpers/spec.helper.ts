import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

var config = require('./../../config');

global.Promise = Promise;
Promise.promisifyAll(mongoose);
(<any>mongoose).Promise = Promise;

before(done => {
    mongoose.connect(config.db.test.url);

    let removeCollectionPromises = [];

    for (let i in mongoose.connection.collections) {
        removeCollectionPromises.push(mongoose.connection.collections[i].remove({}));
    }

    Promise.all(removeCollectionPromises).then(() => done());
});

beforeEach(done => {

    let removeCollectionPromises = [];

    for (let i in mongoose.connection.collections) {
        removeCollectionPromises.push(mongoose.connection.collections[i].remove({}));
    }

    Promise.all(removeCollectionPromises).then(() => done());
});

after(done => {
    mongoose.disconnect();

    done();
});