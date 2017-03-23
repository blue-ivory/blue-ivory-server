"use strict";
const mongoose = require("mongoose");
const request_1 = require("./../classes/request");
const task_1 = require("./../classes/task");
const organization_manager_1 = require("./../managers/organization.manager");
var taskSchema = new mongoose.Schema({
    order: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: [
            task_1.TaskType.HUMAN,
            task_1.TaskType.CAR
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
            task_1.TaskStatus.APPROVED,
            task_1.TaskStatus.DENIED,
            task_1.TaskStatus.PENDING
        ],
        required: true,
        default: task_1.TaskStatus.PENDING
    }
});
var requestSchema = new mongoose.Schema({
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
            request_1.CarType.NONE,
            request_1.CarType.PRIVATE,
            request_1.CarType.ARMY
        ],
        default: request_1.CarType.NONE
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
    let organizationManager = new organization_manager_1.OrganizationManager();
    let organizationId = this.organization;
    organizationManager.getWorkflow(organizationId).then((workflow) => {
        if (workflow && workflow.length > 0) {
            this.workflow = workflow;
        }
        else {
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
var RequestModel = mongoose.model("Request", requestSchema);
module.exports = RequestModel;
