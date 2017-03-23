"use strict";
const mongoose = require("mongoose");
const permission_1 = require("./../classes/permission");
const autopopulate = require("mongoose-autopopulate");
var permissionSchema = new mongoose.Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        autopopulate: true
    },
    organizationPermissions: {
        type: [{
                type: String,
                enum: [
                    permission_1.Permission.APPROVE_CAR,
                    permission_1.Permission.APPROVE_CIVILIAN,
                    permission_1.Permission.APPROVE_SOLDIER,
                    permission_1.Permission.EDIT_USER_PERMISSIONS,
                    permission_1.Permission.EDIT_WORKFLOW,
                    permission_1.Permission.NORMAL_USER
                ]
            }],
    }
}, { _id: false });
var userSchema = new mongoose.Schema({
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
                if (canEditWorkflow(uniquePermissions) || ret.isAdmin) {
                    ret.permittedRoutes.push({ resource: 'workflow', title: 'manage_workflow', route: 'workflow/' });
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
var UserModel = mongoose.model("User", userSchema);
var canApprove = (permissions) => {
    return !!(permissions.find(permission => {
        return permission === permission_1.Permission.APPROVE_CAR || permission === permission_1.Permission.APPROVE_CIVILIAN || permission === permission_1.Permission.APPROVE_SOLDIER;
    }));
};
var canModifyUserSettings = (permissions) => {
    return permissions.indexOf(permission_1.Permission.EDIT_USER_PERMISSIONS) !== -1;
};
var canEditWorkflow = (permissions) => {
    return permissions.indexOf(permission_1.Permission.EDIT_WORKFLOW) !== -1;
};
module.exports = UserModel;
