import * as express from 'express';
import { User } from "../user/user.class";

// TODO : implement authentication!!
export class AuthMiddleware {
    public static requireLogin(req: express.Request, res: express.Response, next: express.NextFunction) {

        User.findUser('unique@id').then(user => {
            req.user = user;

            if (req.user) {
                return next();
            }

            return res.redirect('/login');
        }).catch(err => {
            return res.redirect('/login');
        })
    }
}