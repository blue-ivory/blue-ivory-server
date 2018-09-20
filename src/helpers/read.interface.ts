import { Document } from 'mongoose';

export interface IRead {
    find: (cond: Object, populate: Object | string) => Promise<Document[]>;
    findById: (id: any) => Promise<Document>;
    findOne: (cond: Object) => Promise<Document>;
}