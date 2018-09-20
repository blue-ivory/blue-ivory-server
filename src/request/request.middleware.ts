import * as express from 'express';
import { Types } from 'mongoose';
import { IUser } from "../user/user.interface";
import { Permission } from './../permission/permission.class';
import { PermissionType } from './../permission/permission.enum';
import { Request } from './request.class';
import { IRequest } from "./request.interface";

export class RequestsMiddleware {
    public static async canEdit(req: express.Request, res: express.Response, next: express.NextFunction) {
        let requestId: Types.ObjectId = null;
        let user = <IUser>req.user;

        try {
            requestId = new Types.ObjectId(req.params['id']);
        } catch (err) {
            return res.sendStatus(400);
        }

        let request = <IRequest>await Request.findRequest(requestId);
        if (request && request.requestor._id === user._id) {
            return next();
        }

        return res.status(403).send();
    }

    public static async canDelete(req: express.Request, res: express.Response, next: express.NextFunction) {
        let requestId: Types.ObjectId = null;
        let user = <IUser>req.user;

        try {
            requestId = new Types.ObjectId(req.params['id']);
        } catch (err) {
            return res.status(400).send();
        }

        let request = <IRequest>await Request.findRequest(requestId);
        if (request && request.requestor._id === user._id) {
            return next();
        }

        let hasPermission: boolean = await Permission.hasPermissionForOrganization(user._id,
            [PermissionType.DELETE_REQUEST], request.organization._id);
        if (hasPermission) {
            return next();
        }

        return res.status(403).send();
    }
}