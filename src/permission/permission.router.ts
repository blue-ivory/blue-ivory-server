import * as express from 'express';
import { Types } from 'mongoose';
import { AuthMiddleware } from './../middlewares/auth.middleware';
import { IUser } from './../user/user.interface';
import { Permission } from './permission.class';
import { PermissionType } from "./permission.enum";

let router: express.Router = express.Router();

/**
 * POST /api/permissions
 * Returns whether user has required permissions
 * Requires user to be logged in
 */
router.post('/permissions',
    AuthMiddleware.requireLogin,
    async (req: express.Request, res: express.Response) => {
        let permissions = <PermissionType[]>req.body.permissions;
        let some: boolean = req.body.some;
        let user: IUser = req.user;

        if (!permissions) {
            return res.status(400).send();
        }

        try {
            let hasPermissions: boolean = await Permission.hasPermissions(user._id, permissions, some);
            return res.json(hasPermissions);
        } catch (err) {
            console.error(err);
            return res.status(500).send();
        }
    });

/**
 * POST /api/permissions/3
 * Returns whether user has required permissions for specific organization
 * Requires user to be logged in
 */
router.post('/permissions/:organizationId', AuthMiddleware.requireLogin,
    async (req: express.Request, res: express.Response) => {
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

        try {
            let hasPermissions: boolean = await Permission.hasPermissionForOrganization(user._id, permissions, organizationId, some);
            return res.json(hasPermissions);
        } catch (error) {
            console.error(error);
            return res.sendStatus(500);
        }
    });

export = router;
