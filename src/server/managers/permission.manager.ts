import { User } from './../classes/user';
import { Organization } from './../classes/organization';
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

    public setPermissions(userId: string, organization: Organization, permissions: Permission[]): Promise<any> {
        let deferred = Promise.defer();

        // Remove duplicates
        let uniquePermissions = Array.from(new Set(permissions));

        UserModel.findById(userId).populate('permissions.organization').exec((err, user: User) => {
            if (err) {
                deferred.reject(err);
            } else if (!user) {
                deferred.reject('User not found');
            } else {
                let organizationPermissionsExists: boolean = true;
                let organizationPermissions = user.permissions
                    .find(permission => {
                        return permission.organization._id.equals(organization._id);
                    });


                if (!organizationPermissions) {
                    organizationPermissionsExists = false;
                    organizationPermissions = { organization: organization, permissions: [] };
                }

                organizationPermissions.permissions = uniquePermissions;

                let updateFilter = {
                    _id: userId
                };

                if (uniquePermissions.length > 0 && organizationPermissionsExists) {
                    updateFilter['permissions.organization'] = organization._id;
                }

                let updateValue = {};

                if (uniquePermissions.length === 0) {
                    updateValue = {
                        '$pull': {
                            'permissions': {
                                'organization': organization._id
                            }
                        }
                    }
                } else {
                    if (organizationPermissionsExists) {
                        updateValue['$set'] = {
                            'permissions.$.permissions': uniquePermissions
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
}