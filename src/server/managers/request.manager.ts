import { IDAO } from './../interfaces/IDAO';
import { Request } from './../classes/request';
import { User } from './../classes/user';
import * as RequestModel from './../models/request.model';
import { VisitorManager } from './../managers/visitor.manager';
import * as Promise from 'bluebird';
require('./../models/visitor.model');

export class RequestManager implements IDAO<Request>{
    public static MY_FILTER(user: User): Object {
        return {
            'requestor': user._id
        };
    }

    public static PENDING_FILTER(user: User): Object {

        // TODO : Check user role type to create relevant filter
        return {
            'status': {
                '$ne': -1
            }
        }
    }

    public all(): Promise<any> {
        let deferred = Promise.defer();

        RequestModel.find({})/*.populate([{ path: 'requestor' }, { path: 'visitor' }, { path: 'authorizer' }])*/.exec((err, requests) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(requests);
            }
        });

        return deferred.promise;
    }

    public create(request: Request): Promise<any> {

        let deferred = Promise.defer();


        let visitorManager = new VisitorManager();

        visitorManager.readOrCreate(request.visitor).then(visitor => {
            request.visitor = visitor;
            let requestModel = new RequestModel(request);
            requestModel.save((err, request) => {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(request);
                }
            });
        }).catch(err => {
            deferred.reject(err);
        });

        return deferred.promise;
    }

    public read(id): Promise<any> {
        let deferred = Promise.defer();
        RequestModel.findById(id, (err, request) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(request);
            }
        });

        return deferred.promise;
    }

    public search(searchTerm?: string, filter?: Object, paginationOptions?: { skip: number, limit: number }): Promise<any> {
        let deferred = Promise.defer();
        let visitorManager = new VisitorManager();

        let populateFields = [
            { path: 'requestor', select: 'firstName lastName mail' },
            { path: 'authorizer', select: 'firstName lastName mail' },
            { path: 'visitor' }
        ];

        searchTerm = searchTerm ? searchTerm.replace(/[^\s\w\d\u0590-\u05FF]/gi, '') : '';

        visitorManager.search(searchTerm).then(visitors => {
            let visitorsId = visitors.map(visitor => {
                return visitor._id;
            });

            let queryFilter = {
                '$and': [
                    { 'visitor': { '$in': visitorsId } },
                    filter ? filter : {}
                ]
            };

            let requestPromise = RequestModel.find(queryFilter).populate(populateFields);
            let countPromise = RequestModel.count(queryFilter);

            if (paginationOptions) {
                requestPromise = requestPromise
                    .skip(paginationOptions.skip)
                    .limit(paginationOptions.limit);
            }

            Promise.all([requestPromise, countPromise]).then(values => {
                let result = {
                    requests: values[0],
                    totalCount: values[1]
                };

                deferred.resolve(result);
            }).catch(error => deferred.reject(error));
        }, err => {
            console.error(err);
            deferred.reject(err);
        });

        return deferred.promise;
    }

    public searchByType(type: string, searchTerm: string, user: User, paginationOptions?: { skip: number, limit: number }): Promise<any> {
        return this.search(searchTerm, this.filterByType(type, user), paginationOptions);
    }

    public update(request: Request): Promise<any> {
        let deferred = Promise.defer();
        console.log(request);
        RequestModel.findOneAndUpdate({ _id: request._id }, request, { upsert: true }, (err, request) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(request);
            }
        });

        return deferred.promise;
    }

    public delete(id): Promise<any> {
        let deferred = Promise.defer();
        RequestModel.findOneAndRemove({ _id: id }, (err, request) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(request);
            }
        });

        return deferred.promise;
    }

    private filterByType(type: string, user: User): Object {
        let filter: {
            requestor?: string,
            status?: Object
        } = {};

        switch (type) {
            case 'my':
                filter.requestor = user._id;
                break;
            case 'pending':
                filter.status = {
                    '$ne': -1
                };
                break;
        }
        return filter;
    }
}