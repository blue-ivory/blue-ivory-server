/// <reference path="./../../../typings/index.d.ts" />

import * as mongoose from 'mongoose';
import { User } from './../classes/user';
import { Permission } from './../classes/permission';

var permissionSchema: mongoose.Schema = new mongoose.Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    organizationPermissions: {
        type: [{
            type: String,
            enum: [
                Permission.ADMIN,
                Permission.APPROVE_CAR,
                Permission.APPROVE_CIVILIAN,
                Permission.APPROVE_SOLDIER,
                Permission.EDIT_USER_PERMISSIONS,
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
    permissions: [permissionSchema]
});

userSchema.virtual('uniqueId').get(() => {
    return this._id;
});

var UserModel = mongoose.model<User>("User", userSchema);

export = UserModel;