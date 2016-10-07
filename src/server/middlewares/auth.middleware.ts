import * as express from 'express';
import { UserManager } from './../managers/user.manager';
// TODO : implement authentication!!
export class AuthMiddleware {
    public static requireLogin(req: express.Request, res: express.Response, next: express.NextFunction) {
        let um = new UserManager;

        um.read('unique@id').then(user => {
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