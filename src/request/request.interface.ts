import { IUser } from './../user/user.interface';
import { IRequestTask } from './request-task.interface';
import { Document, Types } from 'mongoose';
import { IOrganization } from './../organization/organization.interface';
import { IVisitor } from './../visitor/visitor.interface';
import { TaskStatus } from "../workflow/task-status.enum";
import { IComment } from "./comments/comment.interface";

export interface IRequest extends Document {
    _id: Types.ObjectId;
    requestDate: Date;
    startDate: Date;
    endDate: Date;
    phoneNumber: string;
    visitor: IVisitor;
    requestor: IUser;
    description: string;
    isSoldier: boolean;
    needEscort: boolean;
    car: CarType;
    type: string;
    rank: string;
    status: TaskStatus;
    carNumber: string;
    organization: IOrganization;
    workflow: IRequestTask[];
    comments: IComment[];
}

export enum CarType {
    NONE = "NONE",
    PRIVATE = "PRIVATE",
    ARMY = "ARMY"
}
