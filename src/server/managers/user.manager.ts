import { IDAO } from './../interfaces/IDAO';
import { User } from './../classes/user';
import { Organization } from './../classes/organization';
import * as Promise from 'bluebird';
import * as UserModel from './../models/user.model';
import { OrganizationManager } from './../managers/organization.manager';

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

    public search(searchTerm?: string, paginationOptions?: { skip: number, limit: number }): Promise<any> {
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

    public setOrganization(userId: string, organizationId: any): Promise<any> {
        let deferred = Promise.defer();
        let organizationManger = new OrganizationManager();

        organizationManger.read(organizationId).then((organization: Organization) => {
            if (organization) {
                UserModel.findByIdAndUpdate(userId, { organization: organization }, { new: true }).populate('organization').exec((err, user) => {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(user);
                    }
                });
            } else {
                deferred.reject("Organization not found");
            }
        }).catch(error => {
            deferred.reject(error);
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