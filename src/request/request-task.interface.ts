import { Document, Types } from 'mongoose';
import { TaskStatus } from "../workflow/task-status.enum";
import { ITask } from "../workflow/task.interface";
import { IUser } from './../user/user.interface';

export interface IRequestTask extends ITask, Document {
    _id: Types.ObjectId;
    authorizer: IUser;
    lastChangeDate: Date;
    status: TaskStatus;
    securityClearance?: number;
    confirmationNumber?: number;
    needEscort?: boolean;
    needTag?: boolean;
}