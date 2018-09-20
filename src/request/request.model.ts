import * as mongoose from 'mongoose';
import { TaskStatus } from "../workflow/task-status.enum";
import { TaskType } from "../workflow/task-type.enum";
import { ITask } from "../workflow/task.interface";
import { Organization } from './../organization/organization.class';
import { commentSchema } from "./comments/comment.schema";
import { CarType, IRequest } from "./request.interface";

var taskSchema: mongoose.Schema = new mongoose.Schema({
    order: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: [
            TaskType.HUMAN,
            TaskType.CAR
        ],
        required: true
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    authorizer: {
        type: String,
        ref: 'User'
    },
    lastChangeDate: {
        type: Date
    },
    status: {
        type: String,
        enum: [
            TaskStatus.APPROVED,
            TaskStatus.DENIED,
            TaskStatus.PENDING
        ],
        required: true,
        default: TaskStatus.PENDING
    },
    needEscort: {
        type: Boolean,
        default: false
    },
    needTag: {
        type: Boolean,
        default: false
    },
    securityClearance: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    confirmationNumber: {
        type: Number
    }
});

var requestSchema: mongoose.Schema = new mongoose.Schema({
    requestDate: {
        type: Date,
        default: new Date()
    },
    endDate: {
        type: Date,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    requestor: {
        type: String,
        ref: 'User',
        required: true
    },
    visitor: {
        type: String,
        ref: 'Visitor',
        required: true
    },
    description: {
        type: String
    },
    phoneNumber: {
        type: String
    },
    isSoldier: {
        type: Boolean,
        default: false
    },
    car: {
        type: String,
        enum: [
            CarType.NONE,
            CarType.PRIVATE,
            CarType.ARMY
        ],
        default: CarType.NONE
    },
    carNumber: {
        type: String,
        required: false
    },
    type: { // Visitor type
        type: String,
        required: true
    },
    rank: {
        type: String
    },
    needEscort: {
        type: Boolean,
        default: false
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    workflow: {
        type: [
            taskSchema
        ]
    },
    status: {
        type: String,
        enum: [
            TaskStatus.APPROVED,
            TaskStatus.DENIED,
            TaskStatus.PENDING
        ],
        required: true,
        default: TaskStatus.PENDING
    },
    comments: {
        type: [
            commentSchema
        ],
        default: []
    }
});

requestSchema.pre('save', async function (next) {

    const document = this as IRequest;
    let organizationId = document.organization;

    if (document.visitor._id && document.visitor._id.length <= 7) {
        document.isSoldier = true;
    }

    try {
        let workflow: ITask[] = await Organization.getWorkflow(organizationId as any);
        if (workflow && workflow.length > 0) {
            if (document.car === CarType.NONE) {
                workflow = workflow.filter((task: ITask) => {
                    return task.type !== TaskType.CAR;
                });
            }
            document.workflow = workflow as any;
        } else {
            let error = new Error('Cannot save request because workflow not assigned to organization yet');
            next(error);
        }

        next();
    } catch (err) {
        let error = new Error(err);
        console.error(err);

        next(error);
    }
});

export let RequestModel = mongoose.model<IRequest>("Request", requestSchema);
