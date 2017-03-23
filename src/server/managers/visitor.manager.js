"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const VisitorModel = require("./../models/visitor.model");
const Promise = require("bluebird");
class VisitorManager {
    all() {
        let deferred = Promise.defer();
        VisitorModel.find((err, visitors) => {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(visitors);
            }
        });
        return deferred.promise;
    }
    create(visitor) {
        let deferred = Promise.defer();
        let visitorModel = new VisitorModel(visitor);
        visitorModel.save((err, visitor) => {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(visitor);
            }
        });
        return deferred.promise;
    }
    read(id) {
        let deferred = Promise.defer();
        VisitorModel.findById(id, (err, visitor) => {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(visitor);
            }
        });
        return deferred.promise;
    }
    update(visitor) {
        let deferred = Promise.defer();
        VisitorModel.findOneAndUpdate({ _id: visitor._id }, visitor, { new: true, upsert: true }, (err, user) => {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(visitor);
            }
        });
        return deferred.promise;
    }
    delete(id) {
        let deferred = Promise.defer();
        VisitorModel.findOneAndRemove({ _id: id }, (err, visitor) => {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(visitor);
            }
        });
        return deferred.promise;
    }
    readOrCreate(visitor) {
        let deferred = Promise.defer();
        if (!visitor) {
            deferred.reject('Visitor is a required field');
        }
        else {
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
                console.error(err);
                deferred.reject(err);
            });
        }
        return deferred.promise;
    }
    search(searchTerm) {
        let deferred = Promise.defer();
        VisitorModel.find(this.searchFilter(searchTerm), (err, visitors) => {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(visitors);
            }
        });
        return deferred.promise;
    }
    searchFilter(searchTerm) {
        if (!searchTerm) {
            return {};
        }
        let searchRegex = new RegExp(searchTerm, 'i');
        let query = {
            '$or': [
                { '_id': searchRegex },
                { 'name': searchRegex }
            ]
        };
        return query;
    }
}
exports.VisitorManager = VisitorManager;
