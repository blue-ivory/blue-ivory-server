import * as express from 'express';
import { Types } from "mongoose";
import { AuthMiddleware } from "../../middlewares/auth.middleware";
import { IRequest } from "../request.interface";
import { Comment } from "./comment.class";
import { IComment } from "./comment.interface";

export default function () {

    let router: express.Router = express.Router();

    router.post('/comment/:requestId', AuthMiddleware.requireLogin, async (req: express.Request, res: express.Response) => {
        let comment = <IComment>req.body.comment;
        let requestId: Types.ObjectId = null;

        try {
            requestId = new Types.ObjectId(req.params['requestId']);
        } catch (err) {
            return res.sendStatus(400);
        }

        try {
            let request = <IRequest>await Comment.addComment(requestId, comment);
            return res.json(request);
        } catch (err) {
            console.error(err);
            return res.sendStatus(500);
        }
    });

    return router;
}