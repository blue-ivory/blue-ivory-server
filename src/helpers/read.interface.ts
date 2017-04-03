import { Document } from 'mongoose';
import * as Promise from 'bluebird';

export interface IRead {
    find: (cond: Object, populate: Object | string) => Promise<Document[]>;
    findById: (id: any) => Promise<Document>;
    findOne: (cond: Object) => Promise<Document>;
}