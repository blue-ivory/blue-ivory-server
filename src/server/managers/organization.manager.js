"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise = require("bluebird");
const OrganizationModel = require("./../models/organization.model");
class OrganizationManager {
    all() {
        return OrganizationModel.find({});
    }
    create(organization) {
        let deferred = Promise.defer();
        let organizationModel = new OrganizationModel(organization);
        organizationModel.save((err, organization) => {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(organization);
            }
        });
        return deferred.promise;
    }
    read(id) {
        let deferred = Promise.defer();
        OrganizationModel.findById(id, (err, organization) => {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(organization);
            }
        });
        return deferred.promise;
    }
    update(organization) {
        let deferred = Promise.defer();
        OrganizationModel.findByIdAndUpdate(organization._id, organization, { new: true }, (err, organization) => {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(organization);
            }
        });
        return deferred.promise;
    }
    delete(id) {
        let deferred = Promise.defer();
        OrganizationModel.findByIdAndRemove(id, (err, organization) => {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(organization);
            }
        });
        return deferred.promise;
    }
    search(searchTerm, paginationOptions) {
        let deferred = Promise.defer();
        let re = new RegExp(searchTerm, 'i');
        let countPromise = OrganizationModel.count({ name: re });
        let organizationsPromise = OrganizationModel.aggregate().match({ name: re }).lookup({
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
        });
        if (paginationOptions) {
            organizationsPromise = organizationsPromise.skip(paginationOptions.skip).limit(paginationOptions.limit);
        }
        Promise.all([countPromise, organizationsPromise]).then(values => {
            let result = {
                totalCount: values[0],
                organizations: values[1]
            };
            deferred.resolve(result);
        }).catch(error => {
            deferred.reject(error);
        });
        return deferred.promise;
    }
    setWorkflow(organizationId, workflow) {
        let deferred = Promise.defer();
        let uniqueWorkflow = workflow ? this.getUniqueTasks(workflow) : workflow;
        OrganizationModel.findByIdAndUpdate(organizationId, { workflow: uniqueWorkflow }, { new: true }).then((organization) => {
            if (organization) {
                deferred.resolve(organization);
            }
            else {
                deferred.reject('Organization not found');
            }
        }).catch(error => {
            console.error(error);
            deferred.reject(error);
        });
        return deferred.promise;
    }
    getWorkflow(id) {
        let deferred = Promise.defer();
        OrganizationModel.findById(id).populate('workflow.organization', { name: 1 }).then((organization) => {
            if (!organization) {
                deferred.reject('Organization not found');
            }
            else {
                deferred.resolve(organization.workflow);
            }
        }).catch(error => {
            console.error(error);
            deferred.reject(error);
        });
        return deferred.promise;
    }
    getUniqueTasks(workflow) {
        let uniqueTasks = [];
        workflow.forEach(task1 => {
            let exists = false;
            uniqueTasks.forEach(task2 => {
                if (task2.organization._id === task1.organization._id && task2.type === task1.type) {
                    exists = true;
                }
            });
            if (!exists) {
                uniqueTasks.push(task1);
            }
        });
        return uniqueTasks;
    }
}
exports.OrganizationManager = OrganizationManager;
