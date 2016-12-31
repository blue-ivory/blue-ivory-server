import { User } from './../classes/user';
import { Permission } from './../classes/permission';
import * as UserModel from './../models/user.model';
import * as Promise from 'bluebird';

export class PermissionManager {
    public hasPermissions(user: User, permissions: Permission[]): boolean {
        if (!permissions) {
            return true;
        }
        if (!user.permissions) {
            return permissions.length === 0;
        }

        let hasPermissions: boolean = true;

        permissions.forEach(permission => {
            if (user.permissions.indexOf(permission) <= -1) {
                hasPermissions = false;
            }
        });

        return hasPermissions;
    }
}