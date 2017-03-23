"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_manager_1 = require("./../managers/user.manager");
// TODO : implement authentication!!
class AuthMiddleware {
    static requireLogin(req, res, next) {
        let um = new user_manager_1.UserManager;
        um.read('unique@id').then(user => {
            req.user = user;
            if (req.user) {
                return next();
            }
            return res.redirect('/login');
        }).catch(err => {
            return res.redirect('/login');
        });
    }
}
exports.AuthMiddleware = AuthMiddleware;
