"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RequestModel = require("./../models/request.model");
const visitor_manager_1 = require("./../managers/visitor.manager");
const organization_manager_1 = require("./../managers/organization.manager");
const Promise = require("bluebird");
require('./../models/visitor.model');
class RequestManager {
    static MY_FILTER(user) {
        return {
            'requestor': user._id
        };
    }
    static PENDING_FILTER(user) {
        // TODO : Check user role type to create relevant filter
        return {
            'status': {
                '$ne': -1
            }
        };
    }
    all() {
        let deferred = Promise.defer();
        RequestModel.find({}) /*.populate([{ path: 'requestor' }, { path: 'visitor' }, { path: 'authorizer' }])*/.exec((err, requests) => {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(requests);
            }
        });
        return deferred.promise;
    }
    create(request) {
        let deferred = Promise.defer();
        let visitorManager = new visitor_manager_1.VisitorManager();
        let organizationManager = new organization_manager_1.OrganizationManager();
        organizationManager.read(request.organization ? request.organization._id : null).then((organization) => {
            if (!organization) {
                deferred.reject('Organization not found');
            }
            else {
                request.organization = organization;
                visitorManager.readOrCreate(request.visitor).then(visitor => {
                    request.visitor = visitor;
                    let requestModel = new RequestModel(request);
                    requestModel.save().then(request => {
                        deferred.resolve(request);
                    }).catch(error => {
                        deferred.reject(error);
                    });
                }).catch(error => {
                    deferred.reject(error);
                });
                ;
            }
        }).catch(error => {
            deferred.reject(error);
        });
        return deferred.promise;
    }
    read(id) {
        let deferred = Promise.defer();
        RequestModel.findById(id, (err, request) => {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(request);
            }
        });
        return deferred.promise;
    }
    search(searchTerm, filter, paginationOptions) {
        let deferred = Promise.defer();
        let visitorManager = new visitor_manager_1.VisitorManager();
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
    searchByType(type, searchTerm, user, paginationOptions) {
        return this.search(searchTerm, this.filterByType(type, user), paginationOptions);
    }
    update(request) {
        let deferred = Promise.defer();
        console.log(request);
        RequestModel.findOneAndUpdate({ _id: request._id }, request, { upsert: true }, (err, request) => {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(request);
            }
        });
        return deferred.promise;
    }
    delete(id) {
        let deferred = Promise.defer();
        RequestModel.findOneAndRemove({ _id: id }, (err, request) => {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(request);
            }
        });
        return deferred.promise;
    }
    filterByType(type, user) {
        let filter = {};
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
exports.RequestManager = RequestManager;
