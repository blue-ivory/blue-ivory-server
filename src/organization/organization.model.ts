import * as mongoose from 'mongoose';
import { IOrganization } from './organization.interface';
import { TaskType } from "../workflow/task-type.enum";

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

export let OrganizationModel = mongoose.model<IOrganization>("Organization", organizationSchema);