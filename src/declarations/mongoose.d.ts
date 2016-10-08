declare module "main" {
    import Bluebird = require('bluebird');
    type MongoosePromise<T> = Bluebird<T>;
}