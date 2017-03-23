import { Organization } from './organization';
import * as mongoose from 'mongoose';
import Types = mongoose.Types;

export class Task {
    public type: TaskType;
    public organization: Organization;
    public order: number;

    constructor(orderNumber: number, organization: Organization, taskType: TaskType) {
        this.order = orderNumber;
        this.type = taskType;
        this.organization = organization;
    }

    equals(task: Task): boolean {
        return task.organization._id.equals(this.organization._id) && task.type === this.type;
    }
}
export enum TaskType {
    HUMAN = <any>'HUMAN',
    CAR = <any>'CAR'
}
export enum TaskStatus {
    PENDING = <any>'PENDING',
    APPROVED = <any>'APPROVED',
    DENIED = <any>'DENIED'
}