/// <reference path="./../../../typings/index.d.ts" />

import * as mongoose from 'mongoose';
import { User } from './../classes/user';

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
    base: {
        type: String
    }
});

userSchema.virtual('uniqueId').get(()=>{
    return this._id;
});

var UserModel = mongoose.model<User>("User", userSchema);

export = UserModel;