import { Document } from 'mongoose';

export interface IVisitor extends Document {
    name: string;
    company: string;
    _id: string;
}