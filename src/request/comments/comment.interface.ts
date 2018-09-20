import { Document } from 'mongoose';
import { IUser } from "../../user/user.interface";

export interface IComment extends Document {
    _id: any;
    content: string;
    date: Date;
    creator: IUser;
}