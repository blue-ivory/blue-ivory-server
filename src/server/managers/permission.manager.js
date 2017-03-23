"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UserModel = require("./../models/user.model");
const Promise = require("bluebird");
class PermissionManager {
    // Check if user has permission (for all organization)    
    hasPermissions(userId, permissions, some) {
        let deferred = Promise.defer();
        UserModel.findById(userId, (err, user) => {
            if (err) {
                console.error(err);
                deferred.reject(err);
            }
            else if (!user) {
                deferred.reject("User " + userId + " not found");
            }
            else if (true === user.isAdmin) {
                deferred.resolve(true);
            }
            else {
                let hasPermissions = false;
                let userPermissions = this.getPermissionsForAllOrganization(user);
                // If not all permissions are required (at least one is enough)
                if (some) {
                    hasPermissions = userPermissions.some(permission => permissions.indexOf(permission) > -1);
                }
                else {
                    // Check whether user has all required permissions
                    hasPermissions = permissions.every(permission => userPermissions.indexOf(permission) > -1);
                }
                deferred.resolve(hasPermissions || permissions.length === 0);
            }
        });
        return deferred.promise;
    }
    // Check if user has permission for specific organization    
    hasPermissionForOrganization(userId, permissions, organizationId, some) {
        let deferred = Promise.defer();
        UserModel.findById(userId).populate('organization').populate('permissions.organization').exec((err, user) => {
            if (err) {
                console.error(err);
                deferred.reject(err);
            }
            else if (!user) {
                deferred.reject("User " + userId + " not found");
            }
            else if (true === user.isAdmin) {
                deferred.resolve(true);
            }
            else {
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
                    }
                    else {
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
    setPermissions(userId, organization, permissions) {
        let deferred = Promise.defer();
        // Remove duplicates
        let uniquePermissions = Array.from(new Set(permissions));
        UserModel.findById(userId).populate('organization').populate('permissions.organization').exec((err, user) => {
            if (err) {
                deferred.reject(err);
            }
            else if (!user) {
                deferred.reject('User not found');
            }
            else {
                let organizationPermissionsExists = false;
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
                }
                else {
                    if (organizationPermissionsExists) {
                        updateValue['$set'] = {
                            'permissions.$.organizationPermissions': uniquePermissions
                        };
                    }
                    else {
                        updateValue['$push'] = {
                            permissions: organizationPermissions
                        };
                    }
                }
                UserModel.findOneAndUpdate(updateFilter, updateValue, { new: true })
                    .populate('organization').populate('permissions.organization').exec((err, user) => {
                    if (err) {
                        deferred.reject(err);
                    }
                    else {
                        deferred.resolve(user);
                    }
                });
            }
        });
        return deferred.promise;
    }
    // Get all user's permissions (for all organization)    
    getPermissionsForAllOrganization(user) {
        let permissions = [];
        if (user && user.permissions) {
            user.permissions.forEach(permission => {
                permissions = permissions.concat(permission.organizationPermissions);
            });
            permissions = this.uniqueArrayValues(permissions);
        }
        return permissions;
    }
    // Remove duplicates from array    
    uniqueArrayValues(array) {
        return Array.from(new Set(array));
    }
}
exports.PermissionManager = PermissionManager;
