/// <reference path="./../typings/index.d.ts" />

import * as express from 'express';
import * as bodyParser from 'body-parser';

const app: express.Application = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const port:number = 80;
const router: express.Router = express.Router();

router.get('/', (req:express.Request, res:express.Response): void => {
    res.json({message: 'Hello!'});
});

app.use('/api', router);

var server = app.listen(port, ()=> {
    console.log('Application is running port %s', port);
});
