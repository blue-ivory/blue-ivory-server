"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise = require("bluebird");
const UserModel = require("./../models/user.model");
const organization_manager_1 = require("./../managers/organization.manager");
class UserManager {
    all() {
        let deferred = Promise.defer();
        UserModel.find().populate('organization').exec((err, users) => {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(users);
            }
        });
        return deferred.promise;
    }
    create(user) {
        let deferred = Promise.defer();
        let userModel = new UserModel(user);
        userModel.save((err, user) => {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(user);
            }
        });
        return deferred.promise;
    }
    read(id) {
        let deferred = Promise.defer();
        UserModel.findById(id, (err, user) => {
            if (err) {
                deferred.reject(err);
            }
            else {
                // deferred.resolve(user);
                this.populateOrganizationAndResolve(user, deferred);
            }
        });
        return deferred.promise;
    }
    update(user) {
        let deferred = Promise.defer();
        UserModel.findOneAndUpdate({ _id: user._id }, user, { new: true }, (err, user) => {
            if (err) {
                deferred.reject(err);
            }
            else {
                // deferred.resolve(user);
                this.populateOrganizationAndResolve(user, deferred);
            }
        });
        return deferred.promise;
    }
    delete(id) {
        let deferred = Promise.defer();
        UserModel.findOneAndRemove({ _id: id }, (err, user) => {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(user);
            }
        });
        return deferred.promise;
    }
    search(searchTerm, paginationOptions) {
        let deferred = Promise.defer();
        let re = new RegExp(searchTerm, "i");
        let filter = {
            $or: [{
                    _id: re // got uniqueId
                }, {
                    $or: [{
                            firstName: re
                        }, {
                            lastName: re
                        }]
                },
                this.filterForName(searchTerm)
            ]
        };
        let usersPromise = UserModel.find(filter).populate('organization').populate('permissions.organization');
        if (paginationOptions) {
            usersPromise = usersPromise
                .skip(paginationOptions.skip)
                .limit(paginationOptions.limit);
        }
        let countPromise = UserModel.count(filter);
        Promise.all([usersPromise, countPromise]).then(values => {
            let result = {
                users: values[0],
                totalCount: values[1]
            };
            deferred.resolve(result);
        }).catch(error => {
            deferred.reject(error);
        });
        return deferred.promise;
    }
    filterForName(searchTerm) {
        let filter = {};
        if (searchTerm && searchTerm.indexOf(' ') !== -1) {
            let term = searchTerm.split(' ');
            let term1 = new RegExp(term[0], "i");
            let term2 = new RegExp(term[1], "i");
            filter = {
                $or: [
                    {
                        $and: [
                            {
                                firstName: term1
                            },
                            {
                                lastName: term2
                            }
                        ]
                    }, {
                        $and: [
                            {
                                firstName: term2
                            },
                            {
                                lastName: term1
                            }
                        ]
                    }
                ]
            };
        }
        else {
            let term = new RegExp(searchTerm, "i");
            filter = {
                $or: [{
                        firstName: term
                    }, {
                        lastName: term
                    }]
            };
        }
        return filter;
    }
    setOrganization(userId, organizationId) {
        let deferred = Promise.defer();
        let organizationManger = new organization_manager_1.OrganizationManager();
        organizationManger.read(organizationId).then((organization) => {
            if (organization) {
                UserModel.findByIdAndUpdate(userId, { organization: organization }, { new: true }).populate('organization').exec((err, user) => {
                    if (err) {
                        deferred.reject(err);
                    }
                    else {
                        deferred.resolve(user);
                    }
                });
            }
            else {
                deferred.reject("Organization not found");
            }
        }).catch(error => {
            deferred.reject(error);
        });
        return deferred.promise;
    }
    populateOrganizationAndResolve(user, deferred) {
        UserModel.populate(user, { path: 'organization' }, (err, user) => {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(user);
            }
        });
    }
}
exports.UserManager = UserManager;
