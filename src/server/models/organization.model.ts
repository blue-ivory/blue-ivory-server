/// <reference path="./../../../typings/index.d.ts" />

import { TaskType } from './../classes/task';

// TODO : Add workflow to schema

import * as mongoose from 'mongoose';
import { Organization } from './../classes/organization';


var taskSchema: mongoose.Schema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: [
            TaskType.HUMAN,
            TaskType.CAR
        ],
        default: TaskType.HUMAN
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    order: {
        type: Number,
        required: true
    }
}, { _id: false });

var organizationSchema: mongoose.Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    workflow: {
        type: [
            taskSchema
        ],
        default: []
    }
});

var OrganizationModel = mongoose.model<Organization>("Organization", organizationSchema);

export = OrganizationModel;