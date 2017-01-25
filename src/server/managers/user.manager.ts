import { IDAO } from './../interfaces/IDAO';
import { User } from './../classes/user';
import { Organization } from './../classes/organization';
import * as Promise from 'bluebird';
import * as UserModel from './../models/user.model';

export class UserManager implements IDAO<User>{
    public all(): Promise<any> {
        let deferred = Promise.defer();
        UserModel.find().populate('organization').exec((err, users) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(users);
            }
        });

        return deferred.promise;
    }

    public create(user: User): Promise<any> {
        let deferred = Promise.defer();
        let userModel = new UserModel(user);
        userModel.save((err, user) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(user);
            }
        });
        return deferred.promise;
    }

    public read(id: string): Promise<any> {
        let deferred = Promise.defer();
        UserModel.findById(id, (err, user) => {
            if (err) {
                deferred.reject(err);
            } else {
                // deferred.resolve(user);
                this.populateOrganizationAndResolve(user, deferred);
            }
        });

        return deferred.promise;
    }

    public update(user: User): Promise<any> {
        let deferred = Promise.defer();
        UserModel.findOneAndUpdate({ _id: user._id }, user, { new: true }, (err, user) => {
            if (err) {
                deferred.reject(err);
            } else {
                // deferred.resolve(user);
                this.populateOrganizationAndResolve(user, deferred);
            }
        });

        return deferred.promise;
    }

    public delete(id: string): Promise<any> {
        let deferred = Promise.defer();
        UserModel.findOneAndRemove({ _id: id }, (err, user) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(user);
            }
        });

        return deferred.promise;
    }

    public search(searchTerm?: string): Promise<any> {
        let deferred = Promise.defer();
        let re = new RegExp(searchTerm, "i")


        UserModel.find({
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
        }).populate('organization').exec((err, users) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(users);
            }
        });

        return deferred.promise;
    }

    private filterForName(searchTerm?: string): Object {
        let filter = {};

        if (searchTerm && searchTerm.indexOf(' ') !== -1) {
            let term: string[] = searchTerm.split(' ');
            let term1: RegExp = new RegExp(term[0], "i");
            let term2: RegExp = new RegExp(term[1], "i");
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
        } else { // Single word
            let term: RegExp = new RegExp(searchTerm, "i");

            filter = {
                $or: [{
                    firstName: term
                }, {
                    lastName: term
                }]
            }
        }
        return filter;
    }

    public setOrganization(userId: string, organization: Organization): Promise<any> {
        let deferred = Promise.defer();

        UserModel.findByIdAndUpdate(userId, { organization: organization }, { new: true }).populate('organization').exec((err, user) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(user);
            }
        });

        return deferred.promise;
    }

    private populateOrganizationAndResolve(user: User, deferred: Promise.Resolver<{}>) {
        UserModel.populate(user, { path: 'organization' }, (err, user) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(user);
            }
        });
    }
}