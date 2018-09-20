import * as mongoose from 'mongoose';
import { IRequest } from "../request.interface";
import { RequestModel } from "../request.model";
import { IComment } from "./comment.interface";

export class Comment {
    static async addComment(id: mongoose.Types.ObjectId, comment: IComment): Promise<IRequest> {
        if (!comment || !comment.content || !comment.creator) {
            throw new Error('Comment is not valid');
        }
        return RequestModel.findByIdAndUpdate(id,
            { $push: { 'comments': comment } },
            { new: true }).populate({path: 'comments.creator', select: 'firstName lastName _id'}).exec();
    }
}