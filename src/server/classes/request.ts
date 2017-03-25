import { IVisitor } from './visitor';
import { IUser } from './user';
import { IOrganization } from './organization';
import { Document } from 'mongoose';

export interface IRequest extends Document {
    _id;
    requestDate: Date;
    startDate: Date;
    endDate: Date;
    visitor: IVisitor;
    requestor: IUser;
    authorizer: IUser;
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
