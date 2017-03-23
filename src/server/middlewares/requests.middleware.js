"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RequestsMiddleware {
    static requireRequestOwner(req, res, next) {
        let request = req.body.request;
        let user = req.user;
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
exports.RequestsMiddleware = RequestsMiddleware;
