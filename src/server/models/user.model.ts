/// <reference path="./../../../typings/index.d.ts" />

import * as mongoose from 'mongoose';
import { User } from './../classes/user';
import { Permission } from './../classes/permission';
import * as autopopulate from 'mongoose-autopopulate';

var permissionSchema: mongoose.Schema = new mongoose.Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        autopopulate: true
    },
    organizationPermissions: {
        type: [{
            type: String,
            enum: [
                Permission.APPROVE_CAR,
                Permission.APPROVE_CIVILIAN,
                Permission.APPROVE_SOLDIER,
                Permission.EDIT_USER_PERMISSIONS,
                Permission.EDIT_WORKFLOW,
                Permission.NORMAL_USER
            ]
        }],
    }
}, { _id: false });

var userSchema: mongoose.Schema = new mongoose.Schema({
    _id: {
        type: String
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    mail: {
        type: String,
        required: true,
        unique: true
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    permissions: [permissionSchema]
}, {
        toJSON: {
            transform: (doc, ret) => {
                let permissions = ret.permissions;

                if (permissions) {
                    let allPermissions = [];
                    permissions.forEach(permission => {
                        allPermissions.push(...permission.organizationPermissions);
                    });


                    let uniquePermissions = Array.from(new Set(allPermissions));
                    ret.permittedRoutes = [
                        { resource: 'requests', title: 'all_requests', route: 'requests/all/' },
                        { resource: 'requests', title: 'my_requests', route: 'requests/my/' }
                    ];
                    if (canApprove(uniquePermissions) || ret.isAdmin) {
                        ret.permittedRoutes.push({ resource: 'requests', title: 'pending_requests', route: 'requests/pending/' });
                    }

                    if (canModifyUserSettings(uniquePermissions) || ret.isAdmin) {
                        ret.permittedRoutes.push({ resource: 'users', title: 'users', route: 'users/' });
                    }

                    if (ret.isAdmin) {
                        ret.permittedRoutes.push({ resource: 'organizations', title: 'organizations', route: 'organizations/' });
                    }
                }
            }

        }
    });

userSchema.virtual('uniqueId').get(() => {
    return this._id;
});

userSchema.plugin(autopopulate);

var UserModel = mongoose.model<User>("User", userSchema);

export = UserModel;

var canApprove = (permissions: Permission[]): boolean => {
    return !!(permissions.find(permission => {
        return permission === Permission.APPROVE_CAR || permission === Permission.APPROVE_CIVILIAN || permission === Permission.APPROVE_SOLDIER;
    }));
}

var canModifyUserSettings = (permissions: Permission[]): boolean => {
    return permissions.indexOf(Permission.EDIT_USER_PERMISSIONS) !== -1;
}