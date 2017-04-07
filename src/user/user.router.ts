import { Types } from 'mongoose';
import * as express from 'express';
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { PermissionsMiddleware } from "../permission/permission.middleware";
import { PermissionType } from "../permission/permission.enum";
import { User } from "./user.class";
import { IUser } from "./user.interface";
import { IOrganization } from "../organization/organization.interface";
import { Pagination } from "../pagination/pagination.class";

let router: express.Router = express.Router();

/**
 * GET /api/user
 * Returns all users
 * Allowed only for 'EDIT_USER_PERMISSIONS' permission
 * Accepts pagination
 */
router.get('/user',
    AuthMiddleware.requireLogin,
    PermissionsMiddleware.hasPermissions([PermissionType.EDIT_USER_PERMISSIONS]),
    (req: express.Request, res: express.Response) => {
        let searchTerm = req.query['searchTerm'];

        User.searchUsers(searchTerm, Pagination.getPaginationOptions(req)).then((users) => {
            return res.json(users);
        }).catch((error) => {
            console.error(error);
            return res.sendStatus(500);
        });
    });

/**
 * GET /api/user/current
 * Returns the current user
 * Requires user to be logged in
 */
router.get('/user/current',
    AuthMiddleware.requireLogin,
    (req: express.Request, res: express.Response) => {
        return res.json(req.user);
    });

/**
 * GET /api/user/3
 * Return specific user if exists
 * Required 'EDIT_USER_PERMISSIONS' permission
 */
router.get('/user/:id',
    AuthMiddleware.requireLogin,
    PermissionsMiddleware.hasPermissions([PermissionType.EDIT_USER_PERMISSIONS]),
    (req: express.Request, res: express.Response) => {

        User.findUser(req.params.id).then((user) => {
            if (!user) {
                return res.sendStatus(404);
            }

            return res.json(user);

        }).catch((error) => {
            console.error(error);
            return res.sendStatus(500);
        });
    });

/**
 * PUT /api/user/3/permissions
 * Set user's permission
 * Requires 'EDIT_USER_PERMISSIONS' permission
 */
router.put('/user/:id/permissions',
    AuthMiddleware.requireLogin,
    PermissionsMiddleware.hasPermissions([PermissionType.EDIT_USER_PERMISSIONS]),
    (req: express.Request, res: express.Response) => {
        let userId = req.params.id;
        let permissions: PermissionType[] = req.body.permissions;
        let organizationId: Types.ObjectId = null;

        try {
            organizationId = new Types.ObjectId(req.body.organizationId);
        } catch (err) {
            return res.sendStatus(400);
        }

        User.setPermissions(userId, organizationId, permissions).then((user: IUser) => {
            return res.json(user);
        }).catch(error => {
            console.error(error);
            return res.sendStatus(500);
        });
    });

/**
 * PUT /api/user/3/organization
 * Change user's organization
 * Requires 'EDIT_USER_PERMISSIONS' permission
 */
router.put('/user/:id/organization',
    AuthMiddleware.requireLogin,
    PermissionsMiddleware.hasPermissions([PermissionType.EDIT_USER_PERMISSIONS]),
    (req: express.Request, res: express.Response) => {
        let userId = req.params.id;
        let organizationId: Types.ObjectId = null;

        try {
            organizationId = new Types.ObjectId(req.body.organizationId);
        } catch (err) {
            return res.sendStatus(400);
        }

        User.setOrganization(userId, organizationId).then((user: IUser) => {
            return res.json(user);
        }).catch(error => {
            console.error(error);
            return res.sendStatus(500);
        });
    });

export = router;
