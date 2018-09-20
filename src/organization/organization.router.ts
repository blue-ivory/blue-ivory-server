import * as express from 'express';
import { Types } from 'mongoose';
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { PermissionType } from "../permission/permission.enum";
import { Pagination } from './../pagination/pagination.class';
import { Permission } from './../permission/permission.class';
import { PermissionsMiddleware } from './../permission/permission.middleware';
import { ITask } from './../workflow/task.interface';
import { Organization } from './organization.class';
import { IOrganization } from './organization.interface';

let router: express.Router = express.Router();

/**
 * GET /api/organization
 * Returns all organizations
 * Allowed only for logged in users
 * Accepts pagination
 */
router.get('/organization',
    AuthMiddleware.requireLogin,
    async (req: express.Request, res: express.Response) => {
        let searchTerm = req.query['searchTerm'];

        try {
            let organizations = await Organization.searchOrganizations(searchTerm, Pagination.getPaginationOptions(req));
            return res.json(organizations);
        } catch (err) {
            console.error(err);
            return res.status(500).send();
        }
    });

/**
 * GET /api/organization/requestable
 * Returns all requestable organizations (organizations with workflow)
 * Allowed only for logged in users
 */
router.get('/organization/requestable',
    AuthMiddleware.requireLogin,
    async (req: express.Request, res: express.Response) => {
        try {
            let organizations = await <Promise<IOrganization[]>>Organization.getRequestableOrganization();

            let promisesArray = organizations.map(org => {
                if (org.canCreateRequests) {
                    return Promise.resolve(true);
                } else {
                    return Permission.hasPermissionForOrganization(req.user._id, [PermissionType.CREATE_REQUESTS], org._id);
                }
            });

            const results = await Promise.all(promisesArray);
            organizations = organizations.filter((org: IOrganization, index: number) => {
                return results[index];
            });

            return res.json(organizations);
        } catch (err) {
            console.error(err);
            return res.status(500).send();
        }
    });

router.put('/organization/:id',
    AuthMiddleware.requireLogin,
    PermissionsMiddleware.hasPermissions([PermissionType.EDIT_WORKFLOW]),
    async (req: express.Request, res: express.Response) => {
        let organizationId: Types.ObjectId = null;
        try {
            organizationId = new Types.ObjectId(req.param('id'));
        } catch (err) {
            return res.sendStatus(400);
        }

        try {
            let update = {
                _id: organizationId
            };

            const bodyKeys = Object.keys(req.body);

            console.log(bodyKeys);

            if (bodyKeys.indexOf('showRequests') !== -1) {
                update['showRequests'] = req.body.showRequests;
            }
            if (bodyKeys.indexOf('canCreateRequests') !== -1) {
                update['canCreateRequests'] = req.body.canCreateRequests;
            }

            console.log(update);

            let org = await Organization.updateOrganization(<IOrganization>update);
            return res.json(org);
        } catch (err) {
            console.error(err);
            return res.status(500).send();
        }
    });

/**
 * GET /api/organization/3/workflow
 * Returns organization's workflow if exists
 * Allowed only for 'EDIT_WORKFLOW' permission
 */
router.get('/organization/:id/workflow',
    AuthMiddleware.requireLogin,
    PermissionsMiddleware.hasPermissions([PermissionType.EDIT_WORKFLOW]),
    async (req: express.Request, res: express.Response) => {
        let organizationId: Types.ObjectId = null;
        try {
            organizationId = new Types.ObjectId(req.param('id'));
        } catch (err) {
            return res.sendStatus(400);
        }

        try {
            let workflow = await Organization.getWorkflow(organizationId);
            return res.json(workflow);
        } catch (err) {
            console.error(err);
            return res.status(500).send();
        }
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
    async (req: express.Request, res: express.Response) => {

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

        try {
            let hasPermissions: boolean = await Permission.hasPermissionForOrganization(req.user._id, [PermissionType.EDIT_WORKFLOW], organizationId);
            if (hasPermissions) {
                let organization = await Organization.setWorkflow(organizationId, workflow);
                if (!organization) {
                    return res.sendStatus(404);
                }
                return res.json(organization);
            } else {
                return res.status(403).send();
            }
        } catch (err) {
            console.error(err);
            return res.status(500).send();
        }
    });

/**
 * POST /api/organization
 * Returns the new organization
 * Allowed only for 'EDIT_WORKFLOW' permission
 */
router.post('/organization',
    AuthMiddleware.requireLogin,
    PermissionsMiddleware.hasPermissions([PermissionType.EDIT_WORKFLOW]),
    async (req: express.Request, res: express.Response) => {
        let organizationName = req.body.organization ? req.body.organization.name : null;

        if (!organizationName) {
            return res.sendStatus(400);
        }

        try {
            let organization = await Organization.createOrganization(organizationName);
            return res.json(organization);
        } catch (err) {
            console.error(err);
            return res.status(500).send();
        }
    });

export = router;
