import { ICollection } from './../helpers/collection';
import { Pagination } from './../pagination/pagination.class';
import { Types } from 'mongoose';
import { RequestsMiddleware } from './request.middleware';
import { IRequest } from './request.interface';
import { Request } from './request.class';
import { AuthMiddleware } from './../middlewares/auth.middleware';
import * as express from 'express';

let router: express.Router = express.Router();

router.post('/request', AuthMiddleware.requireLogin, (req: express.Request, res: express.Response) => {

    // Get request from body
    let request = <IRequest>req.body.request;

    // Create request
    Request.createRequest(request.startDate,
        request.endDate,
        request.visitor,
        req.user,
        request.description,
        request.car,
        request.carNumber,
        request.organization,
        request.phoneNumber).then((request) => {
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
        let request = <IRequest>req.body.request;

        Request.updateRequest(request).then((request) => {
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
        let requestId = <Types.ObjectId>null;

        try {
            requestId = new Types.ObjectId(req.params['id']);
        } catch (err) {
            return res.sendStatus(400);
        }

        Request.deleteRequest(requestId).then(() => {
            return res.sendStatus(200);
        }).catch((error) => {
            console.error(error);
            return res.sendStatus(500);
        });
    });

router.get('/request/all', AuthMiddleware.requireLogin, (req: express.Request, res: express.Response) => {
    search(req, res, Request.searchAllRequests);
});

router.get('/request/my', AuthMiddleware.requireLogin, (req: express.Request, res: express.Response) => {
    search(req, res, Request.searchMyRequests);
});

router.get('/request/pending', AuthMiddleware.requireLogin, (req: express.Request, res: express.Response) => {
    search(req, res, Request.searchPendingRequests);
});

router.get('/request/:id', AuthMiddleware.requireLogin, (req: express.Request, res: express.Response) => {
    let requestId: Types.ObjectId = null;

    try {
        requestId = new Types.ObjectId(req.params['id']);
    } catch(err) {
        return res.sendStatus(400);
    }

    Request.findRequest(requestId).then((request:IRequest) => {
        return res.json(request);
    }).catch(error => {
        console.error(error);
        return res.status(500).send();
    });
});

function search(request: express.Request, response: express.Response, searchFunction: Function) {
    let searchTerm = request.query['searchTerm'];

    searchFunction(request.user, searchTerm, Pagination.getPaginationOptions(request)).then((collection: ICollection<IRequest>) => {
        return response.json(collection);
    }).catch(error => {
        console.error(error);
        return response.sendStatus(500);
    });
}

export = router;
