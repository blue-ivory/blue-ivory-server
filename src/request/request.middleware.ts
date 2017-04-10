import * as express from 'express';
import { Types } from 'mongoose';
import { IUser } from "../user/user.interface";
import { Request } from './request.class';
import { IRequest } from "./request.interface";

export class RequestsMiddleware {
    public static canEdit(req: express.Request, res: express.Response, next: express.NextFunction) {
        let requestId: Types.ObjectId = null;
        let user = <IUser>req.user;

        try {
            requestId = new Types.ObjectId(req.params['id']);
        } catch (err) {
            return res.sendStatus(400);
        }

        Request.findRequest(requestId).then((request: IRequest) => {
            if (request.requestor._id === user._id) {
                return next();
            }

            return res.sendStatus(403);
        });
    }

    public static canDelete(req: express.Request, res: express.Response, next: express.NextFunction) {
        let requestId: Types.ObjectId = null;
        let user = <IUser>req.user;

        try {
            requestId = new Types.ObjectId(req.params['id']);
        } catch (err) {
            return res.sendStatus(400);
        }

        Request.findRequest(requestId).then((request: IRequest) => {
            if (request.requestor._id === user._id) {
                return next();
            }

            return res.sendStatus(403);
        });
    }
}