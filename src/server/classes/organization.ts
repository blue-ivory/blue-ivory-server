import { Task } from './task';
import * as mongoose from 'mongoose';
import Types = mongoose.Types;

export class Organization {
    // TODO : Add workflow to data members

    public name: string;
    public _id: Types.ObjectId;
    public workflow: Task[];

    constructor(name: string) {
        this.name = name;
    }

    equals(org: Organization | Types.ObjectId): boolean {
        if (org instanceof Types.ObjectId) {
            return org.equals(this._id);
        }
        return this._id.equals((<Organization>org)._id);
    }
}