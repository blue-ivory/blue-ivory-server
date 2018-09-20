import * as mongoose from 'mongoose';
import { config } from '../config';

before(async () => {
    mongoose.connect(`mongodb://${config.database.host}/${config.database.db}`, { useNewUrlParser: true });

    let removeCollectionPromises = [];

    for (let i in mongoose.connection.collections) {
        removeCollectionPromises.push(mongoose.connection.collections[i].remove({}));
    }

    await Promise.all(removeCollectionPromises);
});

beforeEach(async () => {

    let removeCollectionPromises = [];

    for (let i in mongoose.connection.collections) {
        removeCollectionPromises.push(mongoose.connection.collections[i].remove({}));
    }

    await Promise.all(removeCollectionPromises);
});

after(done => {
    mongoose.disconnect();

    done();
});