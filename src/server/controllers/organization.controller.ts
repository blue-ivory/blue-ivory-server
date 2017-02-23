/// <reference path="./../../../typings/index.d.ts" />

import * as express from 'express';
import { OrganizationManager } from './../managers/organization.manager';
import { Organization } from './../classes/organization';
import { Permission } from './../classes/permission';
import { AuthMiddleware } from './../middlewares/auth.middleware';
import { PermissionsMiddleware } from './../middlewares/permissions.middleware';


var router: express.Router = express.Router();
var organizationManager = new OrganizationManager();

router.get('/organization',
    AuthMiddleware.requireLogin,
    PermissionsMiddleware.hasPermissions([Permission.EDIT_USER_PERMISSIONS]),
    (req: express.Request, res: express.Response) => {
        let searchTerm = req.param('searchTerm');

        organizationManager.search(searchTerm).then((organization) => {
            return res.json(organization);
        }).catch((error) => {
            console.error(error);
            return res.sendStatus(500);
        });
    });

router.post('/organization',
    AuthMiddleware.requireLogin,
    PermissionsMiddleware.hasPermissions([Permission.EDIT_USER_PERMISSIONS]),
    (req: express.Request, res: express.Response) => {
        organizationManager.create(req.body.organization).then((organization) => {
            return res.json(organization);
        }).catch((error) => {
            console.error(error);
            return res.sendStatus(500);
        });
    });

router.delete('/organization/:id',
    AuthMiddleware.requireLogin,
    PermissionsMiddleware.hasPermissions([Permission.EDIT_USER_PERMISSIONS]),
    (req: express.Request, res: express.Response) => {
        organizationManager.delete(req.params.id).then((organization) => {
            if (!organization) {
                return res.sendStatus(404);
            }

            return res.json(organization);
        }).catch((error) => {
            console.error(error);
            return res.sendStatus(500);
        });
    });

export = router;