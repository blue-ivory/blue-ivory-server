import { Base } from './../classes/base';
import { IDAO } from '../interfaces/IDAO';
import * as BaseModel from './../models/base.model';
import * as Promise from 'bluebird';

export class BaseManager implements IDAO<Base>{
    public all(): Promise<any> {
        let deferred = Promise.defer();

        BaseModel.find({}, (err, bases) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(bases);
            }
        });

        return deferred.promise;
    }
    public create(base: Base): Promise<any> {
        let deferred = Promise.defer();
        let baseModel = new BaseModel(base);

        baseModel.save((err, base) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(base);
            }
        });

        return deferred.promise;
    }
    public read(id): Promise<any> {
        let deferred = Promise.defer();

        BaseModel.findById(id, (err, base) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(base);
            }
        });

        return deferred.promise;
    }
    public update(base: Base): Promise<any> {
        let deferred = Promise.defer();

        BaseModel.findByIdAndUpdate(base._id, base,
            { new: true }, (err, base) => {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(base);
                }
            });

        return deferred.promise;
    }
    public delete(id): Promise<any> {
        let deferred = Promise.defer();

        BaseModel.findByIdAndRemove(id, (err, base) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(base);
            }
        });

        return deferred.promise;
    }

    public search(searchTerm: string): Promise<any> {
        let deferred = Promise.defer();
        let re = new RegExp(searchTerm, 'i');


        BaseModel.aggregate().match({ name: re }).lookup({
            from: "users",
            localField: "_id",
            foreignField: "base",
            as: "users"
        }).project({ name: 1, users: { $size: "$users" } }).exec((err, bases) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(bases);
            }
        });

        return deferred.promise;
    }
}