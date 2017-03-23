"use strict";
const task_1 = require("./../classes/task");
// TODO : Add workflow to schema
const mongoose = require("mongoose");
var taskSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: [
            task_1.TaskType.HUMAN,
            task_1.TaskType.CAR
        ],
        default: task_1.TaskType.HUMAN
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
var organizationSchema = new mongoose.Schema({
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
var OrganizationModel = mongoose.model("Organization", organizationSchema);
module.exports = OrganizationModel;
