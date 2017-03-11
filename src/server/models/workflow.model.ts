/// <reference path="./../../../typings/index.d.ts" />
import { Workflow } from './../classes/workflow';
import { TaskType } from './../classes/task';
import * as mongoose from 'mongoose';

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
    }
}, { _id: false });

var workflowSchema: mongoose.Schema = new mongoose.Schema({
    tasks: {
        type: [
            taskSchema
        ],
        required: true
    }
});

var WorkflowModel = mongoose.model<Workflow>("Workflow", workflowSchema);

export = WorkflowModel;