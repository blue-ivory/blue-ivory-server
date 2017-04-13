import { Types } from 'mongoose';
import { Permission } from './permission.class';
import { IUser } from './../user/user.interface';
import * as express from 'express';
import { AuthMiddleware } from './../middlewares/auth.middleware';
import { PermissionType } from "./permission.enum";

let router: express.Router = express.Router();

/**
 * POST /api/permissions
 * Returns whether user has required permissions
 * Requires user to be logged in
 */
router.post('/permissions',
    AuthMiddleware.requireLogin,
    (req: express.Request, res: express.Response) => {
        let permissions = <PermissionType[]>req.body.permissions;
        let some: boolean = req.body.some;
        let user: IUser = req.user;

        if (!permissions) {
            return res.status(400).send();
        }

        Permission.hasPermissions(user._id, permissions, some).then(hasPermissions => {
            return res.json(hasPermissions);
        }).catch(error => {
            console.error(error);
            return res.sendStatus(500);
        });
    });

/**
 * POST /api/permissions/3
 * Returns whether user has required permissions for specific organization
 * Requires user to be logged in
 */
router.post('/permissions/:organizationId', AuthMiddleware.requireLogin,
    (req: express.Request, res: express.Response) => {
        let permissions = <PermissionType[]>req.body.permissions;
        let some: boolean = req.body.some;
        let user: IUser = req.user;
        let organizationId: Types.ObjectId = null;

        try {
            organizationId = new Types.ObjectId(req.params['organizationId']);
        } catch (err) {
            return res.sendStatus(400);
        }
        if (!permissions) {
            return res.status(400).send();
        }

        Permission.hasPermissionForOrganization(user._id, permissions, organizationId, some).then(hasPermissions => {
            console.log(hasPermissions);
            return res.json(hasPermissions);
        }).catch(error => {
            console.error(error);
            return res.sendStatus(500);
        });
    });

export = router;
