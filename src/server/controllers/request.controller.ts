import * as express from 'express';
import { RequestManager } from './../managers/request.manager';
import { Request } from './../classes/request';
import { AuthMiddleware } from './../middlewares/auth.middleware';
import { RequestsMiddleware } from './../middlewares/requests.middleware';


var router: express.Router = express.Router();
var requestManager = new RequestManager();

router.get('/request/:type', AuthMiddleware.requireLogin, (req: express.Request, res: express.Response) => {

    let type = req.params;
    let searchTerm = req.param('searchTerm');
    let page = +req.param('page');
    let pageSize = +req.param('pageSize');
    let paginationOptions = null;
    if (page && pageSize) {
        paginationOptions = {
            skip: (page - 1) * pageSize,
            limit: pageSize
        };
    }

    requestManager.searchByType(type, searchTerm, req.user, paginationOptions).then((requests) => {
        if (!requests) {
            return res.sendStatus(404);
        }

        return res.json(requests);
    }).catch((error) => {
        console.error(error);
        return res.sendStatus(500);
    });
});

router.post('/request', AuthMiddleware.requireLogin, (req: express.Request, res: express.Response) => {

    // Get request from body
    let request = req.body.request;

    // Set requestor as current user
    request.requestor = req.user._id;

    // Create request
    requestManager.create(request).then((request) => {
        return res.json(request);
    }).catch((error) => {
        console.error(error);
        return res.sendStatus(500);
    });
});

router.put('/request',
    AuthMiddleware.requireLogin,
    RequestsMiddleware.requireRequestOwner,
    (req: express.Request, res: express.Response) => {
        let request = req.body.request;

        requestManager.update(request).then((request) => {
            return res.json(request);
        }).catch((error) => {
            console.error(error);
            return res.sendStatus(500);
        });
    });

router.delete('/request/:id',
    AuthMiddleware.requireLogin,
    RequestsMiddleware.requireRequestOwner,
    (req: express.Request, res: express.Response) => {
        requestManager.delete(req.params.id).then((request) => {
            if (!request) {
                return res.sendStatus(404);
            }

            return res.json(request);
        }).catch((error) => {
            console.error(error);
            return res.sendStatus(500);
        });
    });

export default router;