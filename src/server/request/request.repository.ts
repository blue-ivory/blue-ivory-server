import * as Promise from 'bluebird';
import { IVisitor } from './../visitor/visitor.interface';
import { Visitor } from './../visitor/visitor.class';
import { ICollection } from './../helpers/collection';
import { RequestModel } from './request.model';
import { RepositoryBase } from "../helpers/repository";
import { IRequest } from "./request.interface";
import { IUser } from "../user/user.interface";

export class RequestRepository extends RepositoryBase<IRequest> {
    constructor() {
        super(RequestModel);
    }

    public search(searchTerm?: string, paginationOptions?: { skip: number, limit: number }, filter?: Object): Promise<ICollection<IRequest>> {
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
                    { path: 'requestor', select: 'firstName lastName mail' },
                    { path: 'visitor' }
                ];

                let requestPromise = RequestModel.find(queryFilter).populate(populateFields);
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

                // TODO : resolve(result);
            }).catch(reject);;
        });
    }

    public searchMy(user: IUser, searchTerm?: string, paginationOptions?: { skip: number, limit: number }): Promise<ICollection<IRequest>> {
        let filter = {
            requestor: user._id
        };

        return this.search(searchTerm, paginationOptions, filter);
    }

    public searchPending(user: IUser, searchTerm?: string, paginationOptions?: { skip: number, limit: number }): Promise<ICollection<IRequest>> {
        let filter = {
            // TODO : Create filter based on request status (workflow) and user's permissions
        };

        return this.search(searchTerm, paginationOptions, filter);
    }
}