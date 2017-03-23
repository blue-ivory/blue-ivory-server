"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Task {
    constructor(orderNumber, organization, taskType) {
        this.order = orderNumber;
        this.type = taskType;
        this.organization = organization;
    }
    equals(task) {
        return task.organization._id.equals(this.organization._id) && task.type === this.type;
    }
}
exports.Task = Task;
var TaskType;
(function (TaskType) {
    TaskType[TaskType["HUMAN"] = 'HUMAN'] = "HUMAN";
    TaskType[TaskType["CAR"] = 'CAR'] = "CAR";
})(TaskType = exports.TaskType || (exports.TaskType = {}));
var TaskStatus;
(function (TaskStatus) {
    TaskStatus[TaskStatus["PENDING"] = 'PENDING'] = "PENDING";
    TaskStatus[TaskStatus["APPROVED"] = 'APPROVED'] = "APPROVED";
    TaskStatus[TaskStatus["DENIED"] = 'DENIED'] = "DENIED";
})(TaskStatus = exports.TaskStatus || (exports.TaskStatus = {}));
