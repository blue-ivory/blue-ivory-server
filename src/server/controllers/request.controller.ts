/// <reference path="./../../../typings/index.d.ts" />

import * as express from 'express';
import { RequestManager } from './../managers/request.manager';
import { Request } from './../classes/request';

var router: express.Router = express.Router();
var requestManager = new RequestManager();

router.get('/request', (req: express.Request, res: express.Response) => {
    requestManager.all().then((requests) => {
        return res.json(requests);
    }).catch((error) => {
        console.error(error);
        return res.sendStatus(500);
    });
});

router.get('/request/:id', (req: express.Request, res: express.Response) => {

    requestManager.read(req.params.id).then((request) => {
        if (!request) {
            return res.sendStatus(404);
        }

        return res.json(request);
    }).catch((error) => {
        console.error(error);
        return res.sendStatus(500);
    });
});

router.post('/request', (req: express.Request, res: express.Response) => {
    requestManager.create(req.body.request).then((request) => {
        return res.json(request);
    }).catch((error) => {
        console.error(error);
        return res.sendStatus(500);
    });
});

router.delete('/request/:id', (req: express.Request, res: express.Response) => {
    requestManager.delete(req.params.id).then((request) => {
        if (!request) {
            return res.sendStatus(404);
        }

        return res.json(request);
    }).catch((error) => {
        console.error(error);
        return res.sendStatus(500);
    });
});

export = router;