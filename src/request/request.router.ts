import * as express from 'express';
import { Types } from 'mongoose';
import * as path from 'path';
import { Socket } from "../helpers/socket.handler";
import { Mailer } from "../mailer/mailer.class";
import { Organization } from "../organization/organization.class";
import { IOrganization } from "../organization/organization.interface";
import { Permission } from "../permission/permission.class";
import { PermissionType } from "../permission/permission.enum";
import { TaskStatus } from "../workflow/task-status.enum";
import { TaskType } from "../workflow/task-type.enum";
import { ICollection } from './../helpers/collection';
import { AuthMiddleware } from './../middlewares/auth.middleware';
import { Pagination } from './../pagination/pagination.class';
import { IUser } from './../user/user.interface';
import { IRequestTask } from "./request-task.interface";
import { Request } from './request.class';
import { IRequest } from './request.interface';
import { RequestsMiddleware } from './request.middleware';
import requestSocket from './request.socket';
export default function (socketHandler: Socket) {

    let router: express.Router = express.Router();

    router.post('/request',
        AuthMiddleware.requireLogin,
        async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            const request = req.body.request as IRequest;
            const { organization } = request;

            const fetchedOrganization = await <Promise<IOrganization>>Organization.findOrganization(organization._id);
            console.log(fetchedOrganization.canCreateRequests)
            if (fetchedOrganization.canCreateRequests) {
                return next();
            }

            const hasPermission = await Permission
                .hasPermissionForOrganization(req.user._id,
                [PermissionType.CREATE_REQUESTS],
                organization._id);

            if (hasPermission) {
                return next();
            }

            return res.status(403).send();
        },
        async (req: express.Request, res: express.Response) => {

            // Get request from body
            let request = <IRequest>req.body.request;
            let mailingList = <string[]>req.body.mailingList;
            try {
                // Create request
                let newRequest = <IRequest>await Request.createRequest(request.startDate,
                    request.endDate,
                    request.visitor,
                    req.user,
                    request.description,
                    request.car,
                    request.carNumber,
                    request.organization,
                    request.type,
                    request.rank,
                    request.phoneNumber);

                if (mailingList && mailingList.length > 0) {
                    Mailer.sendMail(mailingList, newRequest);
                }

                requestSocket(socketHandler).emitNewRequest(newRequest);
                return res.json(newRequest);
            } catch (error) {
                console.error(error);
                return res.sendStatus(500);
            };
        });

    router.put('/request/:id',
        AuthMiddleware.requireLogin,
        RequestsMiddleware.canEdit,
        async (req: express.Request, res: express.Response) => {
            let request = <IRequest>req.body.request;

            try {
                let updatedRequest = <IRequest>await Request.updateRequest(request);
                return res.json(updatedRequest);
            } catch (error) {
                console.error(error);
                return res.sendStatus(500);
            }
        });

    router.delete('/request/:id',
        AuthMiddleware.requireLogin,
        RequestsMiddleware.canDelete,
        async (req: express.Request, res: express.Response) => {
            let requestId: Types.ObjectId = null;

            try {
                requestId = new Types.ObjectId(req.params['id']);
            } catch (err) {
                console.error(err);
                return res.sendStatus(400);
            }

            try {
                await Request.deleteRequest(requestId);
                requestSocket(socketHandler).emitDeletedRequest(requestId);
                return res.sendStatus(200);
            } catch (error) {
                console.error(error);
                return res.sendStatus(500);
            }
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

    router.get('/request/:id', AuthMiddleware.requireLogin, async (req: express.Request, res: express.Response) => {
        let requestId: Types.ObjectId = null;

        try {
            requestId = new Types.ObjectId(req.params['id']);
        } catch (err) {
            return res.sendStatus(400);
        }

        try {
            let foundRequest = <IRequest>await Request.findRequest(requestId);
            return res.json(foundRequest);
        } catch (error) {
            console.error(error);
            return res.status(500).send();
        }
    });

    router.put('/request/:id/task/:taskId',
        AuthMiddleware.requireLogin,
        // Check if user has permission to change task's organization 
        async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            let requestId: Types.ObjectId = null;
            let taskId: Types.ObjectId = null;

            try {
                requestId = new Types.ObjectId(req.params['id']);
                taskId = new Types.ObjectId(req.params['taskId']);
            } catch (err) {
                return res.sendStatus(400);
            }

            let request = <IRequest>await Request.findRequest(requestId);
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
            let hasPermission: boolean = await Permission
                .hasPermissionForOrganization(req.user._id, [requiredPermission], task.organization._id);
            res.locals['task'] = task;
            return hasPermission ? next() : res.sendStatus(403);
        },
        async (req: express.Request, res: express.Response) => {
            let status: TaskStatus = req.body.status;
            let confirmationNumber: number = req.body.confirmationNumber;
            let securityClearance: number = req.body.securityClearance;
            let needEscort: boolean = req.body.needEscort;
            let needTag: boolean = req.body.needTag;

            let task: IRequestTask = res.locals['task'];

            if (!status || !task) {
                return res.sendStatus(400);
            }

            try {
                let request = <IRequest>await Request.changeTaskStatus(req.user._id, task._id, status, needEscort, needTag, securityClearance, confirmationNumber);
                if (!request) {
                    return res.sendStatus(404);
                }

                // requestSocket(socketHandler).emitStatusChanged(request._id, request.status)
                return res.json(request);
            } catch (err) {
                console.error(err);
                return res.sendStatus(500);
            }
        });

    router.all('/request/:id/:status',
        AuthMiddleware.requireLogin,
        async (req: express.Request, res: express.Response) => {
            let user = <IUser>req.user;
            let status = <TaskStatus>req.params['status'];
            let requestId: Types.ObjectId = null;

            try {
                requestId = new Types.ObjectId(req.params['id']);
            } catch (err) {
                return res.sendStatus(400);
            }

            try {
                await Request.changeAllApprovableTasksStatus(user, requestId, status);
                return res.sendFile(path.resolve(__dirname + '/../mailer/view/request-status-changed.html'));
            } catch (err) {
                console.error(err);
                return res.sendStatus(500);
            }
        });

    async function search(request: express.Request, response: express.Response, searchFunction: Function) {
        let searchTerm = request.query['searchTerm'];

        try {
            let collection: ICollection<IRequest> = await searchFunction(request.user, searchTerm, Pagination.getPaginationOptions(request));
            return response.json(collection);
        } catch (error) {
            console.error(error);
            return response.sendStatus(500);
        }
    }

    function getRequiredPermission(task: IRequestTask, isSoldier: boolean): PermissionType {
        if (task.type === TaskType.CAR) {
            return PermissionType.APPROVE_CAR;
        }

        return isSoldier ? PermissionType.APPROVE_SOLDIER : PermissionType.APPROVE_CIVILIAN;
    }

    return router;
}
