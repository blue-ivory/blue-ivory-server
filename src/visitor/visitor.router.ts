import { Visitor } from './visitor.class';
import { AuthMiddleware } from './../middlewares/auth.middleware';
import * as express from 'express';

let router: express.Router = express.Router();

/**
 * GET /api/visitor/3
 * Returns visitor by id
 * Requires user to be logged in
 */
router.get('/visitor/:id', AuthMiddleware.requireLogin, (req: express.Request, res: express.Response) => {
    let id: string = req.params['id'];

    if (id.trim()) {
        Visitor.findVisitor(id).then(visitor => {
            return res.json(visitor);
        }).catch(error => res.status(500).send(error));
    } else {
        res.status(400).send();
    }
});

export = router;
