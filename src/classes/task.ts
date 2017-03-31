import { IOrganization } from './organization';
import * as mongoose from 'mongoose';
import Types = mongoose.Types;

export interface ITask {
    type: TaskType;
    organization: IOrganization;
    order: number;
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