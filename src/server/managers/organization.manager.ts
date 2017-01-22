import { Organization } from './../classes/organization';
import { IDAO } from '../interfaces/IDAO';
import * as OrganizationModel from './../models/organization.model';
import * as Promise from 'bluebird';

export class OrganizationManager implements IDAO<Organization>{
    public all(): Promise<any> {
        let deferred = Promise.defer();

        OrganizationModel.find({}, (err, organizations) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(organizations);
            }
        });

        return deferred.promise;
    }
    public create(organization: Organization): Promise<any> {
        let deferred = Promise.defer();
        let organizationModel = new OrganizationModel(organization);

        organizationModel.save((err, organization) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(organization);
            }
        });

        return deferred.promise;
    }
    public read(id): Promise<any> {
        let deferred = Promise.defer();

        OrganizationModel.findById(id, (err, organization) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(organization);
            }
        });

        return deferred.promise;
    }
    public update(organization: Organization): Promise<any> {
        let deferred = Promise.defer();

        OrganizationModel.findByIdAndUpdate(organization._id, organization,
            { new: true }, (err, organization) => {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(organization);
                }
            });

        return deferred.promise;
    }
    public delete(id): Promise<any> {
        let deferred = Promise.defer();

        OrganizationModel.findByIdAndRemove(id, (err, organization) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(organization);
            }
        });

        return deferred.promise;
    }

    public search(searchTerm: string): Promise<any> {
        let deferred = Promise.defer();
        let re = new RegExp(searchTerm, 'i');


        OrganizationModel.aggregate().match({ name: re }).lookup({
            from: "users",
            localField: "_id",
            foreignField: "organization",
            as: "users"
        }).lookup({
            from: "requests",
            localField: "_id",
            foreignField: "organization",
            as: "requests"
        }).project({
            name: 1,
            users: { $size: "$users" },
            requests: { $size: "$requests" }
        }).exec((err, organizations) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(organizations);
            }
        });

        return deferred.promise;
    }
}