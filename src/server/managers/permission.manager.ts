import { User } from './../classes/user';
import { Organization } from './../classes/organization';
import { Permission } from './../classes/permission';
import * as UserModel from './../models/user.model';
import * as Promise from 'bluebird';

export class PermissionManager {

    // Check if user has permission (for all organization)    
    public hasPermissions(userId: string, permissions: Permission[], some?: boolean): Promise<any> {
        let deferred = Promise.defer();

        UserModel.findById(userId, (err, user: User) => {
            if (err) {
                console.error(err);
                deferred.reject(err);
            }
            else if (!user) {
                deferred.reject("User " + userId + " not found");
            } else {
                let hasPermissions = false;

                let userPermissions = this.getPermissionsForAllOrganization(user);

                // If not all permissions are required (at least one is enough)
                if (some) {
                    hasPermissions = userPermissions.some(permission => permissions.indexOf(permission) > -1);
                } else {

                    // Check whether user has all required permissions
                    hasPermissions = permissions.every(permission => userPermissions.indexOf(permission) > -1);
                }


                deferred.resolve(hasPermissions || permissions.length === 0);

            }
        });

        return deferred.promise;
    }

    // Check if user has permission for specific organization    
    public hasPermissionForOrganization(userId: string, permissions: Permission[], organizationId: any, some?: boolean): Promise<any> {
        let deferred = Promise.defer();

        UserModel.findById(userId).populate('organization').populate('permissions.organization').exec((err, user: User) => {
            if (err) {
                console.error(err);
                deferred.reject(err);
            }
            else if (!user) {
                deferred.reject("User " + userId + " not found");
            } else {
                let hasPermissions = permissions.length === 0;
                if (user.permissions) {

                    // Extract user's permission for selected organization
                    let userPermissions = user.permissions.find(permission => {
                        return permission.organization._id.toHexString() == organizationId;
                    });

                    let organizationPermissions = userPermissions ? userPermissions.organizationPermissions : [];

                    // If not all permissions are required (at least one is enough)
                    if (some) {
                        hasPermissions = organizationPermissions.some(permission => permissions.indexOf(permission) > -1);
                    } else {

                        // Check whether user has all required permissions
                        hasPermissions = permissions.every(permission => organizationPermissions.indexOf(permission) > -1);
                    }
                }

                deferred.resolve(hasPermissions || permissions.length === 0);

            }
        });
        return deferred.promise;
    }

    // Set user's permission for specific organization
    public setPermissions(userId: string, organization: Organization, permissions: Permission[]): Promise<any> {
        let deferred = Promise.defer();

        // Remove duplicates
        let uniquePermissions = Array.from(new Set(permissions));

        UserModel.findById(userId).populate('organization').populate('permissions.organization').exec((err, user: User) => {
            if (err) {
                deferred.reject(err);
            } else if (!user) {
                deferred.reject('User not found');
            } else {
                let organizationPermissionsExists: boolean = false;

                user.permissions.forEach(permission => {
                    if (permission.organization._id.equals(organization._id)) {
                        organizationPermissionsExists = true;
                    }
                });

                let organizationPermissions = { organization: organization, organizationPermissions: uniquePermissions };
                let updateFilter = {
                    _id: userId
                };

                if (uniquePermissions.length > 0 && organizationPermissionsExists) {
                    updateFilter['permissions.organization'] = organization._id;
                }

                let updateValue = {};

                if (uniquePermissions.length === 0) {
                    updateValue['$pull'] = {
                        'permissions': {
                            'organization': organization._id
                        }
                    };
                } else {
                    if (organizationPermissionsExists) {
                        updateValue['$set'] = {
                            'permissions.$.organizationPermissions': uniquePermissions
                        };
                    } else {
                        updateValue['$push'] = {
                            permissions: organizationPermissions
                        }
                    }
                }

                UserModel.findOneAndUpdate(updateFilter, updateValue, { new: true })
                    .populate('organization').populate('permissions.organization').exec((err, user: User) => {
                        if (err) {
                            deferred.reject(err);
                        } else {
                            deferred.resolve(user);
                        }
                    });
            }
        });

        return deferred.promise;
    }

    // Get all user's permissions (for all organization)    
    private getPermissionsForAllOrganization(user: User): Permission[] {
        let permissions: Permission[] = [];
        if (user && user.permissions) {
            user.permissions.forEach(permission => {
                permissions = permissions.concat(permission.organizationPermissions);
            });

            permissions = this.uniqueArrayValues(permissions);
        }

        return permissions;
    }

    // Remove duplicates from array    
    private uniqueArrayValues(array: any[]): any[] {
        return Array.from(new Set(array));
    }
}