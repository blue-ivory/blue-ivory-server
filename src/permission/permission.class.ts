import { Types } from "mongoose";
import { User } from './../user/user.class';
import { IUser } from './../user/user.interface';
import { PermissionType } from './permission.enum';

export class Permission {

    static async hasPermissions(userId: string, permissions: PermissionType[], some?: boolean): Promise<boolean> {

        let user = <IUser>await User.findUser(userId);
        if (!user) {
            return false;
        }

        if (user.isAdmin) {
            return true;
        } else {
            let hasPermissions = false;
            let userPermissions = this.extractPermissionsForOrganization(user);

            // if not all permissions are required (at least one is enough)                    
            if (some) {
                hasPermissions = userPermissions.some(permission => permissions.indexOf(permission) > -1);
            } else {

                // check whether user has all required permissions
                hasPermissions = permissions.every(permission => userPermissions.indexOf(permission) > -1);
            }

            return hasPermissions || permissions.length === 0;
        }
    }

    static async hasPermissionForOrganization(userId: string, permissions: PermissionType[], organizationId: Types.ObjectId, some?: boolean): Promise<boolean> {
        let user = <IUser>await User.findUser(userId);
        if (!user) {
            return false;
        }

        if (user.isAdmin) {
            return true;
        } else {
            let hasPermissions = permissions.length === 0;
            if (user.permissions) {

                // Extract user's permission for selected organization
                let userPermissions = user.permissions.find(permission => {
                    return permission.organization._id.equals(organizationId);
                });

                let organizationPermissions = userPermissions ? userPermissions.organizationPermissions : [];

                // if not all permissions are required (at least one is enough)
                if (some) {
                    hasPermissions = organizationPermissions.some(permission => permissions.indexOf(permission) > -1);
                } else {

                    // check whether user has all required permissions
                    hasPermissions = permissions.every(permission => organizationPermissions.indexOf(permission) > -1);
                }
            }

            return hasPermissions || permissions.length === 0;
        }
    }

    // extract user permissions for all organization
    private static extractPermissionsForOrganization(user: IUser): PermissionType[] {
        let permissions: PermissionType[] = [];
        if (user && user.permissions) {
            user.permissions.forEach(permission => {
                permissions = permissions.concat(permission.organizationPermissions);
            });

            permissions = this.uniqueArrayValues(permissions);
        }

        return permissions;
    }

    // remove duplicates from array    
    private static uniqueArrayValues(array: any[]): any[] {
        return Array.from(new Set(array));
    }
}