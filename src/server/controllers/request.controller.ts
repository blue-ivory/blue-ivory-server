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

router.get('/request/search', AuthMiddleware.requireLogin, (req: express.Request, res: express.Response) => {

    let searchTerm = req.param('searchTerm');

    requestManager.search(searchTerm).then((requests) => {
        if (!requests) {
            return res.sendStatus(404);
        }

        return res.json(requests);
    }).catch((error) => {
        console.error(error);
        return res.sendStatus(500);
    });
});

router.get('/request/my', AuthMiddleware.requireLogin, (req: express.Request, res: express.Response) => {
    let searchTerm = req.param('searchTerm');

    requestManager.search(searchTerm, RequestManager.MY_FILTER(req.user)).then((requests) => {
        if (!requests) {
            return res.sendStatus(404);
        }

        return res.json(requests);
    }).catch((error) => {
        console.error(error);
        return res.sendStatus(500);
    });
});

router.get('/request/pending', AuthMiddleware.requireLogin, (req: express.Request, res: express.Response) => {
    let searchTerm = req.param('searchTerm');

    requestManager.search(searchTerm, RequestManager.PENDING_FILTER(req.user)).then((requests) => {
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