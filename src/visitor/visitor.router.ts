import * as express from 'express';
import { ICollection } from "../helpers/collection";
import { Socket } from "../helpers/socket.handler";
import { Pagination } from "../pagination/pagination.class";
import { PermissionType } from "../permission/permission.enum";
import { PermissionsMiddleware } from "../permission/permission.middleware";
import { AuthMiddleware } from './../middlewares/auth.middleware';
import { Visitor } from './visitor.class';
import { IVisitor } from "./visitor.interface";

export default function (socketHandler: Socket) {
    let router: express.Router = express.Router();

    /**
     * GET /api/visitor/3
     * Returns visitor by id
     * Requires user to be logged in
     */
    router.get('/visitor/:id',
        AuthMiddleware.requireLogin,
        async (req: express.Request, res: express.Response) => {
            let id: string = req.params['id'];

            if (id.trim()) {
                try {
                    let visitor = await Visitor.findVisitor(id);
                    return res.json(visitor);
                } catch (err) {
                    res.status(500).send(err);
                }
            } else {
                res.status(400).send();
            }
        });

    router.put('/visitor/',
        AuthMiddleware.requireLogin,
        PermissionsMiddleware.hasPermissions([PermissionType.EDIT_VISITOR_DETAILS]),
        async (req: express.Request, res: express.Response) => {
            let visitor = req.body.visitor;
            try {
                let updatedVisitor = await Visitor.updateVisitor(visitor);
                return res.json(updatedVisitor);
            } catch (err) {
                res.status(500).send(err);
            }

        })

    router.get('/visitor',
        AuthMiddleware.requireLogin,
        PermissionsMiddleware.hasPermissions([PermissionType.EDIT_VISITOR_DETAILS]),
        async (req: express.Request, res: express.Response) => {
            let searchTerm = req.query['searchTerm'];
            try {
                let visitors: ICollection<IVisitor> =
                    await Visitor.searchVisitors(searchTerm,
                        Pagination.getPaginationOptions(req));

                return res.json(visitors);
            } catch (err) {
                console.error(err);
                return res.status(500).send();
            }
        });

    return router;
}