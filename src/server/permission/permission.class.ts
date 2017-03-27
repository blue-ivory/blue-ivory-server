import { User } from './../user/user.class';
import { IUser } from './../user/user.interface';
import { IOrganization } from './../classes/organization';
import { PermissionType } from './permission.enum';
import * as UserModel from './../user/user.model';
import * as Promise from 'bluebird';

export class Permission {

    static hasPermissions(userId: string, permissions: PermissionType[], some?: boolean): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            User.findUser(userId).then((user: IUser) => {
                if (!user) {
                    resolve(false);
                } else if (user.isAdmin) {
                    resolve(true);
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

                    resolve(hasPermissions || permissions.length === 0);
                }
            }).catch(reject);
        });
    }

    static hasPermissionForOrganization(userId: string, permissions: PermissionType[], organizationId: any, some?: boolean): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            User.findUser(userId).then((user: IUser) => {
                if (!user) {
                    resolve(false);
                } else if (user.isAdmin) {
                    resolve(true);
                } else {
                    let hasPermissions = permissions.length === 0;
                    if (user.permissions) {

                        // Extract user's permission for selected organization
                        let userPermissions = user.permissions.find(permission => {
                            return permission.organization._id.toHexString() == organizationId;
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

                    resolve(hasPermissions || permissions.length === 0);
                }
            }).catch(reject);
        });
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