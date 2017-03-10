/// <reference path="./../../../typings/index.d.ts" />

import * as express from 'express';
import { VisitorManager } from './../managers/visitor.manager';
import { Visitor } from './../classes/visitor';
import { AuthMiddleware } from './../middlewares/auth.middleware';


var router: express.Router = express.Router();
var visitorManager = new VisitorManager();

router.get('/visitor/:id', AuthMiddleware.requireLogin, (req: express.Request, res: express.Response) => {

    let id: string = req.param('id');

    if (id.trim()) {
        visitorManager.read(id).then(visitor => res.json(visitor))
            .catch(error => res.status(500).send(error));
    } else {
        res.status(400).send();
    }
});

export = router;