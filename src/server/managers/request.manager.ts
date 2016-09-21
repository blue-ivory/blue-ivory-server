import { IDAO } from './../interfaces/IDAO';
import { Request } from './../classes/request';
import * as RequestModel from './../models/request.model';
import * as Promise from 'bluebird';

export class RequestManager implements IDAO<Request>{
    public all(): Promise<any> {
        let deferred = Promise.defer();

        RequestModel.find((err, requests) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(requests);
            }
        });

        return deferred.promise;
    }

    public create(request: Request): Promise<any> {
        let requestModel = new RequestModel(request);
        let deferred = Promise.defer();

        requestModel.save((err, request) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(request);
            }
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