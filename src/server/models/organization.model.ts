/// <reference path="./../../../typings/index.d.ts" />

// TODO : Add workflow to schema

import * as mongoose from 'mongoose';
import { Organization } from './../classes/organization';

var organizationSchema: mongoose.Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
});

var OrganizationModel = mongoose.model<Organization>("Organization", organizationSchema);

export = OrganizationModel;