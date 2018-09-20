import * as express from 'express';
import { Types } from 'mongoose';
import { ICollection } from "../helpers/collection";
import { Socket } from "../helpers/socket.handler";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { Pagination } from "../pagination/pagination.class";
import { Permission } from "../permission/permission.class";
import { PermissionType } from "../permission/permission.enum";
import { PermissionsMiddleware } from "../permission/permission.middleware";
import { User } from "./user.class";
import { IUser } from "./user.interface";
import userSocket from './user.socket';
export default function (socketHandler: Socket) {

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
        async (req: express.Request, res: express.Response) => {
            let searchTerm = req.query['searchTerm'];
            try {
                let users: ICollection<IUser> =
                    await User.searchUsers(searchTerm,
                        Pagination.getPaginationOptions(req));

                return res.json(users);
            } catch (err) {
                console.error(err);
                return res.status(500).send();
            }
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

    router.get('/user/approvable/:organizationId',
        AuthMiddleware.requireLogin,
        async (req: express.Request, res: express.Response) => {
            let organizationId: Types.ObjectId = null;
            let isSoldier = <boolean>req.query['isSoldier'];
            let hasCar = <boolean>req.query['hasCar'];

            try {
                organizationId = new Types.ObjectId(req.param('organizationId'));
            } catch (err) {
                return res.sendStatus(400);
            }

            try {
                let users: IUser[] = await User.getApprovableUsersByOrganization(organizationId, isSoldier, hasCar);
                return res.json(users);
            } catch (err) {
                console.error(err);
                return res.status(500).send();
            }
        });
    /**
     * GET /api/user/3
     * Return specific user if exists
     * Required 'EDIT_USER_PERMISSIONS' permission
     */
    router.get('/user/:id',
        AuthMiddleware.requireLogin,
        PermissionsMiddleware.hasPermissions([PermissionType.EDIT_USER_PERMISSIONS]),
        async (req: express.Request, res: express.Response) => {
            try {
                let user = <IUser>await User.findUser(req.params.id);
                if (!user) {
                    return res.status(404).send();
                }

                return res.json(user);
            }
            catch (err) {
                console.error(err);
                res.status(500).send();
            }
        });

    /**
     * PUT /api/user/3/permissions
     * Set user's permission
     * Requires 'EDIT_USER_PERMISSIONS' permission
     */
    router.put('/user/:id/permissions',
        AuthMiddleware.requireLogin,
        PermissionsMiddleware.hasPermissions([PermissionType.EDIT_USER_PERMISSIONS]),
        async (req: express.Request, res: express.Response) => {
            let userId = req.params.id;
            let permissions: PermissionType[] = req.body.permissions;
            let organizationId: Types.ObjectId = null;

            try {
                organizationId = new Types.ObjectId(req.body.organizationId);
            } catch (err) {
                return res.sendStatus(400);
            }

            try {
                let user = <IUser>await User.setPermissions(userId, organizationId, permissions);
                userSocket(socketHandler).emitPermissionChanged(user);
                return res.json(user);
            } catch (err) {
                console.error(err);
                return res.status(500).send();
            }
        });

    /**
     * PUT /api/user/3/organization
     * Change user's organization
     * Requires 'EDIT_USER_PERMISSIONS' permission
     */
    router.put('/user/:id/organization',
        AuthMiddleware.requireLogin,
        async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            if (req.user._id === req.params.id) {
                return next();
            }

            let hasPermission: boolean = await Permission.hasPermissions(req.user._id, [PermissionType.EDIT_USER_PERMISSIONS]);
            return hasPermission ? next() : res.sendStatus(403);
        },
        async (req: express.Request, res: express.Response) => {
            let userId = req.params.id;
            let organizationId: Types.ObjectId = null;

            try {
                organizationId = new Types.ObjectId(req.body.organizationId);
            } catch (err) {
                return res.sendStatus(400);
            }

            try {
                let user = <IUser>await User.setOrganization(userId, organizationId);
                userSocket(socketHandler).emitProfileChanged(user);
                return res.json(user);
            } catch (err) {
                console.error(err);
                return res.sendStatus(500);
            }
        });

    router.put('/user/:id/phone',
        AuthMiddleware.requireLogin,
        async (req: express.Request, res: express.Response) => {
            let userId = req.params.id;
            let phoneNumber: String = req.body.phoneNumber;
            if (userId !== req.user._id) {
                return res.sendStatus(403);
            }

            try {
                let user = <IUser> await User.updateUser(<IUser>{ _id: userId, phoneNumber: phoneNumber });
                userSocket(socketHandler).emitProfileChanged(user);
                return res.json(user);
            } catch(err) {
                console.error(err);
                return res.status(500).send();
            }
        }
    )

    return router;
}
