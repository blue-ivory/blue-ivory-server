/// <reference path="./../../../typings/index.d.ts" />

import * as express from 'express';
import { UserManager } from './../managers/user.manager';
import { User } from './../classes/user';

var router: express.Router = express.Router();
var userManager = new UserManager();

router.get('/user', (req: express.Request, res: express.Response) => {
    userManager.all().then((users) => {
        return res.json(users);
    }).catch((error) => {
        console.error(error);
        return res.sendStatus(500);
    });
});

router.get('/user/:id', (req: express.Request, res: express.Response) => {

    userManager.read(req.params.id).then((user) => {
        if (!user) {
            return res.sendStatus(404);
        }

        return res.json(user);

    }).catch((error) => {
        console.error(error);
        return res.sendStatus(500);
    });
});

router.post('/user', (req: express.Request, res: express.Response) => {
    userManager.create(req.body.user).then((user) => {
        return res.json(user);
    }).catch((error) => {
        console.error(error);
        return res.sendStatus(500);
    });
});

router.delete('/user/:id', (req: express.Request, res: express.Response) => {
    userManager.delete(req.params.id).then((user) => {
        if (!user) {
            return res.sendStatus(404);
        }

        return res.json(user);
    }).catch((error) => {
        console.error(error);
        return res.sendStatus(500);
    });
});

export = router;