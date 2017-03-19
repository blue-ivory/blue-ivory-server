import { PermissionManager } from './../managers/permission.manager';
import { Task } from './../classes/task';
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
    (req: express.Request, res: express.Response) => {
        let searchTerm = req.param('searchTerm');
        let page = +req.param('page');
        let pageSize = +req.param('pageSize');
        let paginationOptions = null;
        if (page && pageSize) {
            paginationOptions = {
                skip: (page - 1) * pageSize,
                limit: pageSize
            };
        }

        organizationManager.search(searchTerm, paginationOptions).then((organization) => {
            return res.json(organization);
        }).catch((error) => {
            console.error(error);
            return res.sendStatus(500);
        });
    });

router.get('/organization/:id/workflow',
    AuthMiddleware.requireLogin,
    PermissionsMiddleware.hasPermissions([Permission.EDIT_USER_PERMISSIONS]),
    (req: express.Request, res: express.Response) => {
        let organizationId = req.param('id');

        organizationManager.getWorkflow(organizationId).then((workflow: Task[]) => {
            return res.json(workflow);
        }).catch(error => {
            console.error(error);
            return res.status(500).send();
        });
    });

router.post('/organization/:id/workflow',
    AuthMiddleware.requireLogin,
    PermissionsMiddleware.hasPermissions([Permission.EDIT_USER_PERMISSIONS]),
    (req: express.Request, res: express.Response) => {
        let workflow = req.body.workflow;
        let organizationId = req.body.organizationId;

        let permissionManager: PermissionManager = new PermissionManager();

        permissionManager.hasPermissionForOrganization(req.user._id, [Permission.EDIT_USER_PERMISSIONS], organizationId).then((hasPermissions: boolean) => {
            if (hasPermissions) {
                organizationManager.setWorkflow(organizationId, workflow).then((organization: Organization) => {
                    return res.json(organization);
                }).catch(error => {
                    console.error(error);
                    return res.status(500).send();
                });
            } else {
                return res.status(403).send();
            }
        }).catch(error => {
            console.error(error);
            return res.status(500).send();
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