import { ICollection } from './../helpers/collection';
import { Pagination } from './../pagination/pagination.class';
import { Types } from 'mongoose';
import { RequestsMiddleware } from './request.middleware';
import { IRequest } from './request.interface';
import { Request } from './request.class';
import { AuthMiddleware } from './../middlewares/auth.middleware';
import * as express from 'express';
import { PermissionsMiddleware } from "../permission/permission.middleware";
import { Permission } from "../permission/permission.class";
import { IRequestTask } from "./request-task.interface";
import { PermissionType } from "../permission/permission.enum";
import { TaskType } from "../workflow/task-type.enum";
import { TaskStatus } from "../workflow/task-status.enum";

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

router.put('/request/:id',
    AuthMiddleware.requireLogin,
    RequestsMiddleware.canEdit,
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
    RequestsMiddleware.canDelete,
    (req: express.Request, res: express.Response) => {
        let requestId: Types.ObjectId = null;

        try {
            requestId = new Types.ObjectId(req.params['id']);
        } catch (err) {
            console.log(err);
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

router.get('/request/civilian', AuthMiddleware.requireLogin, (req: express.Request, res: express.Response) => {
    search(req, res, Request.searchCivilianRequests);
});

router.get('/request/soldier', AuthMiddleware.requireLogin, (req: express.Request, res: express.Response) => {
    search(req, res, Request.searchSoldierRequests);
});

router.get('/request/:id', AuthMiddleware.requireLogin, (req: express.Request, res: express.Response) => {
    let requestId: Types.ObjectId = null;

    try {
        requestId = new Types.ObjectId(req.params['id']);
    } catch (err) {
        return res.sendStatus(400);
    }

    Request.findRequest(requestId).then((request: IRequest) => {
        return res.json(request);
    }).catch(error => {
        console.error(error);
        return res.status(500).send();
    });
});

router.put('/request/:id/task/:taskId',
    AuthMiddleware.requireLogin,
    // Check if user has permission to change task's organization 
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
        let requestId: Types.ObjectId = null;
        let taskId: Types.ObjectId = null;

        try {
            requestId = new Types.ObjectId(req.params['id']);
            taskId = new Types.ObjectId(req.params['taskId']);
        } catch (err) {
            return res.sendStatus(400);
        }

        Request.findRequest(requestId).then((request: IRequest) => {
            if (!request) {
                return res.status(404).send('request_not_found');
            }

            let task: IRequestTask = request.workflow.find((task: IRequestTask) => {
                return task._id.equals(taskId);
            });

            if (!task) {
                return res.status(404).send('task_not_found');
            }

            let requiredPermission: PermissionType = getRequiredPermission(task, request.isSoldier);
            Permission.hasPermissionForOrganization(req.user._id, [requiredPermission], task.organization._id).then((hasPermission: boolean) => {
                res.locals['task'] = task;
                return hasPermission ? next() : res.sendStatus(403);
            });
        });
    },
    (req: express.Request, res: express.Response) => {
        let status: TaskStatus = req.body.status;
        let task: IRequestTask = res.locals['task'];

        if (!status || !task) {
            return res.sendStatus(400);
        }

        Request.changeTaskStatus(req.user._id, task._id, status).then((request: IRequest) => {
            if (!request) {
                return res.sendStatus(404);
            }
            return res.json(request);
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

function getRequiredPermission(task: IRequestTask, isSoldier: boolean): PermissionType {
    if (task.type === TaskType.CAR) {
        return PermissionType.APPROVE_CAR;
    }

    return isSoldier ? PermissionType.APPROVE_SOLDIER : PermissionType.APPROVE_CIVILIAN;
}
export = router;
