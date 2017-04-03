module.exports = {
    db: {
        prod: {
            url: process.env.MONGO_URI ? process.env.MONGO_URI : 'mongodb://localhost/blue-ivory-2',
        },
        test: {
            url: process.env.MONGO_URI ? process.env.MONGO_URI + '-testing' : 'mongodb://localhost/blue-ivory-2-test'
        }
    }
}