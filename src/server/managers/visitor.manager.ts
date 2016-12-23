import { IDAO } from './../interfaces/IDAO';
import { Visitor } from './../classes/visitor';
import * as VisitorModel from './../models/visitor.model';
import * as Promise from 'bluebird';

export class VisitorManager implements IDAO<Visitor>{
    public all(): Promise<any> {
        let deferred = Promise.defer();
        VisitorModel.find((err, visitors) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(visitors);
            }
        });

        return deferred.promise;
    }

    public create(visitor: Visitor): Promise<any> {
        let deferred = Promise.defer();
        let visitorModel = new VisitorModel(visitor);
        visitorModel.save((err, visitor) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(visitor);
            }
        });

        return deferred.promise;
    }

    public read(id: string): Promise<any> {
        let deferred = Promise.defer();
        VisitorModel.findById(id, (err, visitor) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(visitor);
            }
        });
        return deferred.promise;
    }

    public update(visitor: Visitor): Promise<any> {
        let deferred = Promise.defer();
        VisitorModel.findOneAndUpdate({ _id: visitor._id }, visitor, { new: true, upsert: true }, (err, user) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(visitor);
            }
        });
        return deferred.promise;
    }

    public delete(id: string): Promise<any> {
        let deferred = Promise.defer();
        VisitorModel.findOneAndRemove({ _id: id }, (err, visitor) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(visitor);
            }
        });
        return deferred.promise;
    }

    public readOrCreate(visitor: Visitor): Promise<any> {
        let deferred = Promise.defer();
        this.read(visitor._id).then(newVisitor => {
            if (newVisitor) {
                deferred.resolve(newVisitor);
            }
            else {
                this.create(visitor).then(visitor => {
                    deferred.resolve(visitor);
                }).catch(err => {
                    deferred.reject(err);
                });
            }
        }).catch(err => {
            console.log(err);
            deferred.reject(err);
        });

        return deferred.promise;
    }

    public search(searchTerm: string): Promise<any> {
        let deferred = Promise.defer();

        VisitorModel.find(this.searchFilter(searchTerm), (err, visitors) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(visitors);
            }
        });

        return deferred.promise;
    }

    private searchFilter(searchTerm: string): Object {
        if (!searchTerm) {
            return {}
        }
        let searchRegex = new RegExp(searchTerm, 'i');
        let query: Object = {
            '$or': [
                { '_id': searchRegex },
                { 'name': searchRegex }
            ]
        };

        return query;
    }
}