import { Workflow } from './../classes/workflow';
/// <reference path="./../../../typings/index.d.ts" />

// TODO : Add workflow to schema

import * as mongoose from 'mongoose';
import { Organization } from './../classes/organization';

var organizationSchema: mongoose.Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    workflow: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workflow'
    }
});

var OrganizationModel = mongoose.model<Organization>("Organization", organizationSchema);

export = OrganizationModel;