import { ITask } from './task';
import * as mongoose from 'mongoose';

export interface IOrganization extends mongoose.Document {

    name: string;
    _id: mongoose.Types.ObjectId;
    workflow: ITask[];
}