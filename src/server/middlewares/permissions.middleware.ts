import * as express from 'express';

import { Permission } from './../classes/permission';
import { Organization } from './../classes/organization';
import { User } from './../classes/user';

import { PermissionManager } from './../managers/permission.manager';

export class PermissionsMiddleware {

    public static hasPermissions(permissions: Permission[], some?: boolean): express.RequestHandler {
        return (req: express.Request, res: express.Response, next: express.NextFunction) => {
            let permissionManager = new PermissionManager();

            let user: User = req.user;

            if (!user) {
                return res.redirect('/login');
            }

            permissionManager.hasPermissions(user._id, permissions, some).then(hasPermissions => {
                if (hasPermissions) {
                    return next();
                }

                return res.status(403).send();
            });
        }
    }

    public static hasPermissionForOrganization(permissions: Permission[],
        organization: Organization,
        some?: boolean): express.RequestHandler {

        return (req: express.Request, res: express.Response, next: express.NextFunction) => {
            let permissionManager = new PermissionManager();

            let user: User = req.user;

            if (!user) {
                return res.redirect('/login');
            }

            permissionManager.hasPermissionForOrganization(user._id, permissions, organization, some).then(hasPermissions => {
                if (hasPermissions) {
                    return next();
                }

                return res.status(403).send();
            });
        }
    }


}