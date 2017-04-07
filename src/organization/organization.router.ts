import * as express from 'express';
import { Types } from 'mongoose';

import { IOrganization } from './organization.interface';
import { ITask } from './../workflow/task.interface';

import { AuthMiddleware } from "../middlewares/auth.middleware";
import { PermissionsMiddleware } from './../permission/permission.middleware';

import { Permission } from './../permission/permission.class';
import { Organization } from './organization.class';
import { Pagination } from './../pagination/pagination.class';

import { PermissionType } from "../permission/permission.enum";

let router: express.Router = express.Router();

/**
 * GET /api/organization
 * Returns all organizations
 * Allowed only for logged in users
 * Accepts pagination
 */
router.get('/organization',
    AuthMiddleware.requireLogin,
    (req: express.Request, res: express.Response) => {
        let searchTerm = req.query['searchTerm'];

        Organization.searchOrganizations(searchTerm, Pagination.getPaginationOptions(req)).then((organizations) => {
            return res.json(organizations);
        }).catch((error) => {
            console.error(error);
            return res.sendStatus(500);
        });
    });

/**
 * GET /api/organization/requestable
 * Returns all requestable organizations (organizations with workflow)
 * Allowed only for logged in users
 */
router.get('/organization/requestable',
    AuthMiddleware.requireLogin,
    (req: express.Request, res: express.Response) => {
        Organization.getRequestableOrganization().then((organizations) => {
            return res.json(organizations);
        }).catch((error) => {
            return res.sendStatus(500);
        });
    });

/**
 * GET /api/organization/3/workflow
 * Returns organization's workflow if exists
 * Allowed only for 'EDIT_WORKFLOW' permission
 */
router.get('/organization/:id/workflow',
    AuthMiddleware.requireLogin,
    PermissionsMiddleware.hasPermissions([PermissionType.EDIT_WORKFLOW]),
    (req: express.Request, res: express.Response) => {
        let organizationId: Types.ObjectId = null;
        try {
            organizationId = new Types.ObjectId(req.param('id'));
        } catch (err) {
            return res.sendStatus(400);
        }

        Organization.getWorkflow(organizationId).then((workflow: ITask[]) => {
            return res.json(workflow);
        }).catch(error => {
            console.error(error);
            return res.status(500).send();
        });
    });


/**
 * POST /api/organization/3/workflow
 * Sets organization's workflow
 * Returns organization after change
 * Requires 'EDIT_WORKFLOW' permission
 */
router.post('/organization/:id/workflow',
    AuthMiddleware.requireLogin,
    PermissionsMiddleware.hasPermissions([PermissionType.EDIT_WORKFLOW]),
    (req: express.Request, res: express.Response) => {

        let organizationId: Types.ObjectId = null;
        let workflow = <ITask[]>req.body.workflow;

        if (!workflow) {
            return res.sendStatus(400);
        }

        try {
            organizationId = new Types.ObjectId(req.params['id']);
        } catch (err) {
            return res.sendStatus(400);
        }

        Permission.hasPermissionForOrganization(req.user._id, [PermissionType.EDIT_WORKFLOW], organizationId).then((hasPermissions: boolean) => {
            if (hasPermissions) {
                Organization.setWorkflow(organizationId, workflow).then((organization: IOrganization) => {
                    if (!organization) {
                        return res.sendStatus(404);
                    }
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

/**
 * POST /api/organization
 * Returns the new organization
 * Allowed only for 'EDIT_WORKFLOW' permission
 */
router.post('/organization',
    AuthMiddleware.requireLogin,
    PermissionsMiddleware.hasPermissions([PermissionType.EDIT_WORKFLOW]),
    (req: express.Request, res: express.Response) => {
        let organizationName = req.body.organization ? req.body.organization.name : null;

        if (!organizationName) {
            return res.sendStatus(400);
        }

        Organization.createOrganization(organizationName).then((organization) => {
            return res.json(organization);
        }).catch((error) => {
            console.error(error);
            return res.sendStatus(500);
        });
    });

export = router;
