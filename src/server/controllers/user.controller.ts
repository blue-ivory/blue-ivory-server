/// <reference path="./../../../typings/index.d.ts" />

import * as express from 'express';
import { UserManager } from './../managers/user.manager';
import { PermissionManager } from './../managers/permission.manager';
import { User } from './../classes/user';
import { Organization } from './../classes/organization';
import { Permission } from './../classes/permission';
import { AuthMiddleware } from './../middlewares/auth.middleware';

var router: express.Router = express.Router();
var userManager = new UserManager();
var permissionManager = new PermissionManager();

router.get('/user', AuthMiddleware.requireLogin, (req: express.Request, res: express.Response) => {
    let searchTerm = req.param('searchTerm');

    userManager.search(searchTerm).then((users) => {
        return res.json(users);
    }).catch((error) => {
        console.error(error);
        return res.sendStatus(500);
    });
});

router.get('/user/current', AuthMiddleware.requireLogin, (req: express.Request, res: express.Response) => {
    return res.json(req.user);
});

router.get('/user/:id', AuthMiddleware.requireLogin, (req: express.Request, res: express.Response) => {

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

router.post('/user', AuthMiddleware.requireLogin, (req: express.Request, res: express.Response) => {
    userManager.create(req.body.user).then((user) => {
        return res.json(user);
    }).catch((error) => {
        console.error(error);
        return res.sendStatus(500);
    });
});

router.put('/user/:id/permissions', AuthMiddleware.requireLogin, (req: express.Request, res: express.Response) => {
    let userId = req.params.id;
    let permissions: Permission[] = req.body.permissions;

    permissionManager.setPermissions(userId, permissions).then((user: User) => {
        return res.json(user);
    }).catch(error => {
        console.error(error);
        return res.sendStatus(500);
    });
});

router.put('/user/:id/organization', AuthMiddleware.requireLogin, (req: express.Request, res: express.Response) => {
    let userId = req.params.id;
    let organization: Organization = req.body.organization;

    userManager.setOrganization(userId, organization).then((user: User) => {
        return res.json(user);
    }).catch(error => {
        console.error(error);
        return res.sendStatus(500);
    });
});

router.delete('/user/:id', AuthMiddleware.requireLogin, (req: express.Request, res: express.Response) => {
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