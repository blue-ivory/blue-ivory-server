import { ITask } from '../classes/task';
import { Document, Types } from 'mongoose';

export interface IOrganization extends Document {

    name: string;
    _id: Types.ObjectId;
    workflow: ITask[];
    users?: number;
    requests?: number;
}