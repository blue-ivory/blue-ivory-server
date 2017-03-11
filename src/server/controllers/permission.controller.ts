/// <reference path="./../../../typings/index.d.ts" />

import * as express from 'express';
import { PermissionManager } from './../managers/permission.manager';
import { Permission } from './../classes/permission';
import { User } from './../classes/user';
import { AuthMiddleware } from './../middlewares/auth.middleware';
import { PermissionsMiddleware } from './../middlewares/permissions.middleware';


var router: express.Router = express.Router();
var permissionManager = new PermissionManager();

router.post('/has-permissions',
    AuthMiddleware.requireLogin,
    (req: express.Request, res: express.Response) => {
        let permissions: Permission[] = req.body.permissions;
        let some: boolean = req.body.some;
        let user: User = req.user;

        if (!permissions) {
            return res.status(400).send();
        }

        permissionManager.hasPermissions(user._id, permissions, some).then(hasPermissions => {
            return res.json(hasPermissions);
        }).catch(error => {
            console.error(error);
            return res.sendStatus(500);
        });
    });

router.all('/has-permissions/organization', AuthMiddleware.requireLogin,
    (req: express.Request, res: express.Response) => {
        let permissions: Permission[] = req.body.permissions;
        let organizationId: any = req.body.organizationId;
        let some: boolean = req.body.some;
        let user: User = req.user;

        if (!permissions || !organizationId) {
            return res.status(400).send();
        }

        permissionManager.hasPermissionForOrganization(user._id, permissions, organizationId, some).then(hasPermissions => {
            return res.json(hasPermissions);
        }).catch(error => {
            console.error(error);
            return res.sendStatus(500);
        });
    });

export = router;