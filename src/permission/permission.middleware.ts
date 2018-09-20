import * as express from 'express';
import { IOrganization } from "../organization/organization.interface";
import { IUser } from "../user/user.interface";
import { Permission } from "./permission.class";
import { PermissionType } from "./permission.enum";

export class PermissionsMiddleware {

    public static hasPermissions(permissions: PermissionType[], some?: boolean): express.RequestHandler {
        return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            let user: IUser = req.user;

            if (!user) {
                return res.redirect('/login');
            }

            let hasPermissions: boolean = await Permission.hasPermissions(user._id, permissions, some);
            if (hasPermissions) {
                return next();
            }

            return res.status(403).send();
        }
    }

    public static hasPermissionForOrganization(permissions: PermissionType[],
        organization: IOrganization,
        some?: boolean): express.RequestHandler {

        return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            let user: IUser = req.user;

            if (!user) {
                return res.redirect('/login');
            }

            let hasPermissions: boolean = await Permission.hasPermissionForOrganization(user._id, permissions, organization._id, some);
            if (hasPermissions) {
                return next();
            }

            return res.status(403).send();
        }
    }
}