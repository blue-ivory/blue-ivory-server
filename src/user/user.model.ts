import * as mongoose from 'mongoose';
import { IUser } from './user.interface';
import { PermissionType } from './../permission/permission.enum';

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
                PermissionType.APPROVE_CAR,
                PermissionType.APPROVE_CIVILIAN,
                PermissionType.APPROVE_SOLDIER,
                PermissionType.EDIT_USER_PERMISSIONS,
                PermissionType.EDIT_WORKFLOW,
                PermissionType.NORMAL_USER
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
                        { resource: 'requests', title: 'all_requests', route: 'requests/all/', searchable: true, icon: 'history' },
                        { resource: 'requests', title: 'my_requests', route: 'requests/my/', searchable: true, icon: 'star' }
                    ];
                    if (canApprove(uniquePermissions) || ret.isAdmin) {
                        ret.permittedRoutes.push({ resource: 'requests', title: 'pending_requests', route: 'requests/pending/', searchable: true, icon: 'access_time' });
                    }

                    if (canModifyUserSettings(uniquePermissions) || ret.isAdmin) {
                        ret.permittedRoutes.push({ resource: 'users', title: 'users', route: 'users/', searchable: true, icon: 'people' });
                    }

                    if (canEditWorkflow(uniquePermissions) || ret.isAdmin) {
                        ret.permittedRoutes.push({ resource: 'workflow', title: 'manage_workflow', route: 'workflow/', searchable: false, icon: 'format_list_bulleted' });
                    }

                    if (ret.isAdmin) {
                        ret.permittedRoutes.push({ resource: 'organizations', title: 'organizations', route: 'organizations/', searchable: true, icon: 'account_balance' });
                    }
                }
            }

        }
    });

userSchema.virtual('uniqueId').get(() => {
    return this._id;
});

export let UserModel = mongoose.model<IUser>("User", userSchema);

var canApprove = (permissions: PermissionType[]): boolean => {
    return !!(permissions.find(permission => {
        return permission === PermissionType.APPROVE_CAR || permission === PermissionType.APPROVE_CIVILIAN || permission === PermissionType.APPROVE_SOLDIER;
    }));
}

var canModifyUserSettings = (permissions: PermissionType[]): boolean => {
    return permissions.indexOf(PermissionType.EDIT_USER_PERMISSIONS) !== -1;
}

var canEditWorkflow = (permissions: PermissionType[]): boolean => {
    return permissions.indexOf(PermissionType.EDIT_WORKFLOW) !== -1;
};