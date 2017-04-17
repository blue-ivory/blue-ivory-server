import * as Promise from 'bluebird';
import { IVisitor } from './../visitor/visitor.interface';
import { Visitor } from './../visitor/visitor.class';
import { ICollection } from './../helpers/collection';
import { RequestModel } from './request.model';
import { RepositoryBase } from "../helpers/repository";
import { IRequest } from "./request.interface";
import { IUser } from "../user/user.interface";
import { IPaginationOptions } from "../pagination/pagination.interface";
import { Types, Document } from "mongoose";
import { ITask } from "../workflow/task.interface";
import { TaskStatus } from "../workflow/task-status.enum";

export class RequestRepository extends RepositoryBase<IRequest> {
    constructor() {
        super(RequestModel);
    }

    public search(searchTerm?: string, paginationOptions?: IPaginationOptions, filter?: Object): Promise<ICollection<IRequest>> {
        return new Promise<ICollection<IRequest>>((resolve, reject) => {
            searchTerm = searchTerm ? searchTerm.replace(/[^\s\w\d\u0590-\u05FF]/gi, '') : '';
            Visitor.searchVisitors(searchTerm).then((visitorsCollection: ICollection<IVisitor>) => {
                let visitors = visitorsCollection.set;
                let visitorsIds = visitors.map((visitor: IVisitor) => {
                    return visitor._id;
                });

                let queryFilter = {
                    '$and': [
                        { 'visitor': { '$in': visitorsIds } },
                        filter ? filter : {}
                    ]
                };

                let populateFields = [
                    { path: 'visitor', select: 'name' },
                    { path: 'organization', select: 'name' }
                ];

                let requestPromise = RequestModel.find(queryFilter).populate(populateFields).select('startDate endDate visitor organization car isSoldier');
                let countPromise = RequestModel.count(queryFilter);

                if (paginationOptions) {
                    requestPromise = requestPromise
                        .skip(paginationOptions.skip)
                        .limit(paginationOptions.limit);
                }

                return Promise.all([requestPromise, countPromise]);
            }).then(values => {
                let result = {
                    set: values[0],
                    totalCount: values[1]
                };

                resolve(result);
            }).catch(reject);;
        });
    }

    public searchMy(user: IUser, searchTerm?: string, paginationOptions?: IPaginationOptions): Promise<ICollection<IRequest>> {
        let filter = {
            requestor: user ? user._id : null
        };

        return this.search(searchTerm, paginationOptions, filter);
    }

    public searchPending(user: IUser, searchTerm?: string, paginationOptions?: IPaginationOptions): Promise<ICollection<IRequest>> {
        let filter = {
            // TODO : Create filter based on request status (workflow) and user's permissions
        };

        return this.search(searchTerm, paginationOptions, filter);
    }

    public searchCivilian(user: IUser, searchTerm?: string, paginationOptions?: IPaginationOptions): Promise<ICollection<IRequest>> {
        let filter = {
            isSoldier: false
        };

        return this.search(searchTerm, paginationOptions, filter);
    }

    public searchSoldier(user: IUser, searchTerm?: string, paginationOptions?: IPaginationOptions): Promise<ICollection<IRequest>> {
        let filter = {
            isSoldier: true
        };

        return this.search(searchTerm, paginationOptions, filter);
    }

    public searchAll(user: IUser, searchTerm?: string, paginationOptions?: IPaginationOptions): Promise<ICollection<IRequest>> {
        let filter = {
            // TODO : Create filter based on view permissions (Workflow orders)
        };

        return this.search(searchTerm, paginationOptions, filter);
    }

    public changeTaskStatus(authorizerId: string, taskId: Types.ObjectId, status: TaskStatus): Promise<IRequest> {
        let populate = [
            { path: 'requestor', select: 'firstName lastName mail' },
            { path: 'workflow.organization', select: 'name' },
            { path: 'workflow.authorizer', select: 'firstName lastName mail' },
            { path: 'organization', select: 'name' },
            { path: 'visitor' }
        ];

        return RequestModel.findOneAndUpdate(
            { 'workflow._id': taskId },
            {
                'workflow.$.status': status,
                'workflow.$.lastChangeDate': new Date(),
                'workflow.$.authorizer': authorizerId
            }, { new: true }).populate(populate).exec();
    }
}