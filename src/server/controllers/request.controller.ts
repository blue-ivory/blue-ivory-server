/// <reference path="./../../../typings/index.d.ts" />

import * as express from 'express';
import { RequestManager } from './../managers/request.manager';
import { Request } from './../classes/request';

var router: express.Router = express.Router();
var requestManager = new RequestManager();

router.get('/request', (req: express.Request, res: express.Response) => {
    requestManager.all((error, requests) => {
        if (error) {
            console.error(error);
            return res.sendStatus(500);
        }

        return res.json(requests);
    });
});

router.get('/request/:id', (req: express.Request, res: express.Response) => {
    requestManager.read(req.params.id, (error, request) => {
        if (error) {
            console.error(error);
            return res.sendStatus(500);
        }
        if(!request){
            return res.sendStatus(404);
        }
        return res.json(request);
    });
});

router.post('/request', (req: express.Request, res: express.Response) => {
    requestManager.create(req.body.request, (error, request) => {
        if (error) {
            console.error(error);
            return res.sendStatus(500);
        }

        return res.json(request);
    });
});

router.delete('/request/:id', (req: express.Request, res: express.Response) => {
    console.log(req.params.id);
    requestManager.delete(req.params.id, (error, request) => {
        if (error) {
            console.error(error);
            return res.sendStatus(500);
        }
        if (!request) {
            return res.sendStatus(404);
        }
        return res.json(request);
    })
})

export = router;