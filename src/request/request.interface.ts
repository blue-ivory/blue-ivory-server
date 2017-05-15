import { IUser } from './../user/user.interface';
import { IRequestTask } from './request-task.interface';
import { Document, Types } from 'mongoose';
import { IOrganization } from './../organization/organization.interface';
import { IVisitor } from './../visitor/visitor.interface';

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
    carNumber: number;
    organization: IOrganization;
    workflow: IRequestTask[];
}

export enum CarType {
    NONE = <any>"NONE",
    PRIVATE = <any>"PRIVATE",
    ARMY = <any>"ARMY"
}
