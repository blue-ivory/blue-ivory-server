/// <reference path="./../../../typings/index.d.ts" />

import * as express from 'express';
import { UserManager } from './../managers/user.manager';
import { User } from './../classes/user';

var router: express.Router = express.Router();
var userManager = new UserManager();

router.get('/user', (req: express.Request, res: express.Response) => {
    userManager.all((error, users) => {
        if (error) {
            console.error(error);
            return res.sendStatus(500);
        }

        return res.json(users);
    });
});

router.get('/user/:id', (req: express.Request, res: express.Response) => {
    userManager.read(req.params.id, (error, user) => {
        if (error) {
            console.error(error);
            return res.sendStatus(500);
        }

        if(!user){
            return res.sendStatus(404);
        }

        return res.json(user);
    });
});

router.post('/user', (req: express.Request, res: express.Response) => {
    userManager.create(req.body.user, (error, user) => {
        if (error) {
            console.error(error);
            return res.sendStatus(500);
        }

        return res.json(user);
    });
});

router.delete('/user/:id', (req: express.Request, res: express.Response) => {
    console.log(req.params.id);
    userManager.delete(req.params.id, (error, user) => {
        if (error) {
            console.error(error);
            return res.sendStatus(500);
        }
        if (!user) {
            return res.sendStatus(404);
        }
        return res.json(user);
    })
})

export = router;