import * as mongoose from 'mongoose';
import { Request, CarType } from './../classes/request';
import { Task, TaskType, TaskStatus } from './../classes/task';
import { OrganizationManager } from './../managers/organization.manager';


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
    authorizer: {
        type: String,
        ref: 'User',
        required: false
    },
    description: {
        type: String
    },
    phone: {
        type: String,
        default: '--'
    },
    isSolider: {
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
        type: Number,
        required: false
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
    }
});

requestSchema.pre('save', function (next) {
    let organizationManager = new OrganizationManager();
    let organizationId = this.organization;

    organizationManager.getWorkflow(organizationId).then((workflow: Task[]) => {
        if (workflow && workflow.length > 0) {
            this.workflow = workflow;
        } else {
            let error = new Error('Cannot save request because workflow not assigned to organization yet');
            next(error);
        }

        next();
    }).catch(err => {
        let error = new Error(err);
        console.error(err);

        next(error);
    });
});

var RequestModel = mongoose.model<Request>("Request", requestSchema);

export = RequestModel;