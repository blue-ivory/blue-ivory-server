/// <reference path="./../../../typings/index.d.ts" />

import * as express from 'express';
import { BaseManager } from './../managers/base.manager';
import { Base } from './../classes/base';
import { AuthMiddleware } from './../middlewares/auth.middleware';

var router: express.Router = express.Router();
var baseManager = new BaseManager();

router.get('/base', AuthMiddleware.requireLogin, (req: express.Request, res: express.Response) => {
    let searchTerm = req.param('searchTerm');

    baseManager.search(searchTerm).then((bases) => {
        return res.json(bases);
    }).catch((error) => {
        console.error(error);
        return res.sendStatus(500);
    });
});

router.post('/base', AuthMiddleware.requireLogin, (req: express.Request, res: express.Response) => {
    baseManager.create(req.body.base).then((base) => {
        return res.json(base);
    }).catch((error) => {
        console.error(error);
        return res.sendStatus(500);
    });
});

router.delete('/base/:id', AuthMiddleware.requireLogin, (req: express.Request, res: express.Response) => {
    baseManager.delete(req.params.id).then((base) => {
        if (!base) {
            return res.sendStatus(404);
        }

        return res.json(base);
    }).catch((error) => {
        console.error(error);
        return res.sendStatus(500);
    });
});

export = router;