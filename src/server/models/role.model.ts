/// <reference path="./../../../typings/index.d.ts" />

import * as mongoose from 'mongoose';
import { Role } from './../classes/role';

var roleSchema: mongoose.Schema = new mongoose.Schema({
    _id: {
        type: String
    }
});

roleSchema.virtual('name').get(() => {
    return this._id;
});

var RoleModel = mongoose.model<Role>("Role", roleSchema);

export = RoleModel;