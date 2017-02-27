import * as express from 'express';
import { User } from './../classes/user';
export class RequestsMiddleware {
    public static requireRequestOwner(req: express.Request, res: express.Response, next: express.NextFunction) {
        let request = req.body.request;
        let user: User = req.user;

        if (!user) {
            return res.redirect('/login');
        }

        if (request && request.requestor) {
            if (request.requestor._id === user._id) {
                return next();
            }
            return res.status(403).send('Only request owner is permitted to edit the request');
        }

        return res.status(400).send();
    }
}