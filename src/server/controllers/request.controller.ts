/// <reference path="./../../../typings/index.d.ts" />

import * as express from 'express';
import { RequestManager } from './../managers/request.manager';
import { Request } from './../classes/request';
import { AuthMiddleware } from './../middlewares/auth.middleware';

var router: express.Router = express.Router();
var requestManager = new RequestManager();

router.get('/request', AuthMiddleware.requireLogin, (req: express.Request, res: express.Response) => {
    requestManager.all().then((requests) => {
        return res.json(requests);
    }).catch((error) => {
        console.error(error);
        return res.sendStatus(500);
    });
});

router.get('/request/:searchTerm', AuthMiddleware.requireLogin, (req: express.Request, res: express.Response) => {

    requestManager.search(req.params.searchTerm).then((requests) => {
        if (!requests) {
            return res.sendStatus(404);
        }

        return res.json(requests);
    }).catch((error) => {
        console.error(error);
        return res.sendStatus(500);
    });
});

router.post('/request', AuthMiddleware.requireLogin, (req: express.Request, res: express.Response) => {

    // Get request from body
    let request = req.body.request;

    // Set requestor as current user
    request.requestor = req.user._id;

    // Create request
    requestManager.create(request).then((request) => {
        return res.json(request);
    }).catch((error) => {
        console.error(error);
        return res.sendStatus(500);
    });
});

router.put('/request', AuthMiddleware.requireLogin, (req: express.Request, res: express.Response) => {
    let request = req.body.request;

    requestManager.update(request).then((request) => {
        return res.json(request);
    }).catch((error) => {
        console.error(error);
        return res.sendStatus(500);
    });
});

router.delete('/request/:id', AuthMiddleware.requireLogin, (req: express.Request, res: express.Response) => {
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