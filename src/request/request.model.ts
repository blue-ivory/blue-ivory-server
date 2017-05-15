import * as mongoose from 'mongoose';
import { IRequestTask } from './request-task.interface';
import { Organization } from './../organization/organization.class';
import { TaskType } from "../workflow/task-type.enum";
import { TaskStatus } from "../workflow/task-status.enum";
import { CarType, IRequest } from "./request.interface";
import { ITask } from "../workflow/task.interface";

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
        type: Number,
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
    }
});

requestSchema.pre('save', function (next) {

    let organizationId = this.organization;

    if (this.visitor._id && this.visitor._id.length <= 7) {
        this.isSoldier = true;
    }

    Organization.getWorkflow(organizationId).then((workflow: ITask[]) => {
        if (workflow && workflow.length > 0) {
            if (this.car === CarType.NONE) {
                workflow = workflow.filter((task: ITask) => {
                    return task.type !== TaskType.CAR;
                });
            }
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

// requestSchema.post('findOneAndUpdate', function (doc: any) {
//     if (doc && doc['workflow']) {
//         let workflow: IRequestTask[] = doc['workflow'];
//         let status: TaskStatus = TaskStatus.PENDING;
//         let foundDenied: boolean = false;
//         let foundApproved: boolean = false;
//         let foundPending: boolean = false;

//         workflow.forEach(task => {
//             if (task.status === TaskStatus.DENIED) {
//                 foundDenied = true;
//             } else if (task.status === TaskStatus.APPROVED) {
//                 foundApproved = true;
//             } else {
//                 foundPending = true;
//             }
//         });

//         if (foundDenied) {
//             status = TaskStatus.DENIED;
//         } else if (foundApproved && !foundPending) {
//             status = TaskStatus.APPROVED;
//         }

//         this.update({}, { $set: { status: status } }).exec();
//     }

// });

export let RequestModel = mongoose.model<IRequest>("Request", requestSchema);
