import { IDAO } from './../interfaces/IDAO';
import { Request } from './../classes/request';
import * as RequestModel from './../models/request.model';
import {VisitorManager} from './../managers/visitor.manager';
import * as Promise from 'bluebird';
require('./../models/visitor.model');

export class RequestManager implements IDAO<Request>{
    public all(): Promise<any> {
        let deferred = Promise.defer();

        RequestModel.find({}).populate([{ path: 'requestor' }, { path: 'visitor' }, { path: 'authorizer' }]).exec((err, requests) => {
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
            console.log(visitor);
            request.visitor = visitor;
            let requestModel = new RequestModel(request);
            requestModel.save((err, request)=>{
                if(err){
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
}