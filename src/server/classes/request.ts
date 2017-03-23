import { Visitor } from './visitor';
import { User } from './user';
import { IOrganization } from './organization';
import * as mongoose from 'mongoose';

export interface IRequest extends mongoose.Document {
    _id;
    requestDate: Date;
    startDate: Date;
    endDate: Date;
    visitor: Visitor;
    requestor: User;
    authorizer: User;
    description: string;
    isSolider: boolean;
    needEscort: boolean;
    car: CarType;
    carNumber: number;
    organization: IOrganization;
}

export enum CarType {
    NONE = <any>"NONE",
    PRIVATE = <any>"PRIVATE",
    ARMY = <any>"ARMY"
}
