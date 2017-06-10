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
    phoneNumber: {
        type: String
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

                    let routeGroups = {
                        general: [
                            { resource: 'requests', title: 'all_requests', route: 'requests/all/', searchable: true, icon: 'history' },
                            { resource: 'requests', title: 'my_requests', route: 'requests/my/', searchable: true, icon: 'star' }
                        ],
                        requests_for: [
                            { resource: 'requests', title: 'civilian', route: 'requests/civilian/', searchable: false, icon: 'label' },
                            { resource: 'requests', title: 'soldier', route: 'requests/soldier/', searchable: false, icon: 'label' }
                        ]
                    }


                    if (canApprove(uniquePermissions) || ret.isAdmin) {
                        routeGroups.general.push({ resource: 'requests', title: 'pending_requests', route: 'requests/pending/', searchable: true, icon: 'access_time' });
                    }

                    if (canModifyUserSettings(uniquePermissions) || ret.isAdmin) {
                        routeGroups.general.push({ resource: 'users', title: 'users', route: 'users/', searchable: true, icon: 'people' });
                    }

                    if (canEditWorkflow(uniquePermissions) || ret.isAdmin) {
                        routeGroups.general.push({ resource: 'workflow', title: 'manage_workflow', route: 'workflow/', searchable: false, icon: 'format_list_bulleted' });
                    }

                    if (ret.isAdmin) {
                        routeGroups.general.push({ resource: 'organizations', title: 'organizations', route: 'organizations/', searchable: true, icon: 'account_balance' });
                    }

                    let id = 0;

                    let routeKeys = Object.keys(routeGroups);
                    for (let key of routeKeys) {
                        routeGroups[key] = routeGroups[key].map((route: any) => {
                            route.id = id++;
                            return route;
                        });
                    }
                    ret.routeGroups = routeGroups;
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