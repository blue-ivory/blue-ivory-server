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

    public addPermissions(user: User, ...permissions: Permission[]): Promise<any> {
        let deferred = Promise.defer();
        UserModel.findOneAndUpdate({ _id: user._id },
            { $addToSet: { permissions: { $each: permissions } } },
            { new: true }, (err, user: User) => {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(user);
                }
            });

        return deferred.promise;
    }

    public removePermissions(user: User, ...permissions: Permission[]): Promise<any> {
        let deferred = Promise.defer();

        UserModel.findOneAndUpdate({ _id: user._id },
            { $pullAll: { permissions: permissions } },
            { new: true }, (err, user: User) => {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(user);
                }
            });

        return deferred.promise;
    }

    public setPermissions(userId: string, permissions: Permission[]): Promise<any> {
        let deferred = Promise.defer();
        
        // Remove duplicates
        let uniquePermissions = Array.from(new Set(permissions));

        UserModel.findOneAndUpdate({ _id: userId },
            { $set: { permissions: uniquePermissions } },
            { new: true }, (err, user: User) => {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(user);
                }
            });

        return deferred.promise;
    }
}