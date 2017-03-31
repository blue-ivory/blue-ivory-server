import * as express from 'express';
import { PermissionType } from "./permission.enum";
import { IUser } from "../user/user.interface";
import { Permission } from "./permission.class";
import { IOrganization } from "../organization/organization.interface";

export class PermissionsMiddleware {

    public static hasPermissions(permissions: PermissionType[], some?: boolean): express.RequestHandler {
        return (req: express.Request, res: express.Response, next: express.NextFunction) => {
            let user: IUser = req.user;

            if (!user) {
                return res.redirect('/login');
            }

            Permission.hasPermissions(user._id, permissions, some).then(hasPermissions => {
                if (hasPermissions) {
                    return next();
                }

                return res.status(403).send();
            });
        }
    }

    public static hasPermissionForOrganization(permissions: PermissionType[],
        organization: IOrganization,
        some?: boolean): express.RequestHandler {

        return (req: express.Request, res: express.Response, next: express.NextFunction) => {
            let user: IUser = req.user;

            if (!user) {
                return res.redirect('/login');
            }

            Permission.hasPermissionForOrganization(user._id, permissions, organization, some).then(hasPermissions => {
                if (hasPermissions) {
                    return next();
                }

                return res.status(403).send();
            });
        }
    }


}