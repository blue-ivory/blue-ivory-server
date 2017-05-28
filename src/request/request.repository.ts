import { Permission } from './../permission/permission.class';
import { IOrganization } from './../organization/organization.interface';
import { Organization } from './../organization/organization.class';
import { IRequestTask } from './request-task.interface';
import * as Promise from 'bluebird';
import { IVisitor } from './../visitor/visitor.interface';
import { Visitor } from './../visitor/visitor.class';
import { ICollection } from './../helpers/collection';
import { RequestModel } from './request.model';
import { RepositoryBase } from "../helpers/repository";
import { IRequest, CarType } from "./request.interface";
import { IUser } from "../user/user.interface";
import { IPaginationOptions } from "../pagination/pagination.interface";
import { Types, Document } from "mongoose";
import { ITask } from "../workflow/task.interface";
import { TaskStatus } from "../workflow/task-status.enum";
import { PermissionType } from "../permission/permission.enum";
import { TaskType } from "../workflow/task-type.enum";

export class RequestRepository extends RepositoryBase<IRequest> {
    constructor() {
        super(RequestModel);
    }

    public search(searchTerm?: string, paginationOptions?: IPaginationOptions, filter?: Object): Promise<ICollection<IRequest>> {
        return new Promise<ICollection<IRequest>>((resolve, reject) => {
            searchTerm = searchTerm ? searchTerm.replace(/[^\s\w\d\u0590-\u05FF]/gi, '') : '';
            Visitor.searchVisitors(searchTerm).then((visitorsCollection: ICollection<IVisitor>) => {
                let visitors = visitorsCollection.set;
                let visitorsIds = visitors.map((visitor: IVisitor) => {
                    return visitor._id;
                });

                let queryFilter = {
                    '$and': [
                        { 'visitor': { '$in': visitorsIds } },
                        filter ? filter : {}
                    ]
                };

                let populateFields = [
                    { path: 'visitor' },
                    { path: 'organization', select: 'name' }
                ];

                let requestPromise = RequestModel.find(queryFilter).populate(populateFields).select('startDate endDate visitor organization car isSoldier status');
                let countPromise = RequestModel.count(queryFilter);

                if (paginationOptions) {
                    requestPromise = requestPromise
                        .skip(paginationOptions.skip)
                        .limit(paginationOptions.limit);
                }

                return Promise.all([requestPromise, countPromise]);
            }).then(values => {
                let result = {
                    set: values[0],
                    totalCount: values[1]
                };

                resolve(result);
            }).catch(reject);;
        });
    }

    public searchMy(user: IUser, searchTerm?: string, paginationOptions?: IPaginationOptions): Promise<ICollection<IRequest>> {
        let filter = {
            requestor: user ? user._id : null
        };

        return this.search(searchTerm, paginationOptions, filter);
    }

    public searchPending(user: IUser, searchTerm?: string, paginationOptions?: IPaginationOptions): Promise<ICollection<IRequest>> {

        let filter: any = {
            $or: []
        }

        if (user && user.permissions && user.permissions.length > 0) {
            user.permissions.forEach(permission => {
                filter.$or.push(this.convertOrganizationPermissionToFilter(permission.organization._id, permission.organizationPermissions));
            })

            if (filter.$or.length < 2) {
                filter = filter.$or[0];
            }
        } else {
            filter = { noop: false };
        }

        return this.search(searchTerm, paginationOptions, filter);
    }

    public searchCivilian(user: IUser, searchTerm?: string, paginationOptions?: IPaginationOptions): Promise<ICollection<IRequest>> {
        let filter = {
            isSoldier: false
        };

        return this.search(searchTerm, paginationOptions, filter);
    }

    public searchSoldier(user: IUser, searchTerm?: string, paginationOptions?: IPaginationOptions): Promise<ICollection<IRequest>> {
        let filter = {
            isSoldier: true
        };

        return this.search(searchTerm, paginationOptions, filter);
    }

    public searchAll(user: IUser, searchTerm?: string, paginationOptions?: IPaginationOptions): Promise<ICollection<IRequest>> {
        if (user && user.organization) {
            return Organization.findOrganization(user.organization._id).then((org: IOrganization) => {
                let tags = org.tags.map(tag => tag._id);

                let filter = {
                    organization: { $in: tags.concat(user.organization._id) }
                };

                return this.search(searchTerm, paginationOptions, filter);
            });
        } else {
            return Promise.resolve(null);
        }
    }

    public changeTaskStatus(authorizerId: string,
        taskId: Types.ObjectId,
        status: TaskStatus,
        needEscort?: boolean,
        needTag?: boolean,
        securityClearance?: number,
        confirmationNumber?: number): Promise<IRequest> {
        let populate = [
            { path: 'requestor', select: 'firstName lastName mail' },
            { path: 'workflow.organization', select: 'name' },
            { path: 'workflow.authorizer', select: 'firstName lastName mail' },
            { path: 'organization', select: 'name' },
            { path: 'visitor' }
        ];

        let additionalFields = {}
        if (confirmationNumber) {
            additionalFields['workflow.$.confirmationNumber'] = confirmationNumber;
        }
        if (needEscort) {
            additionalFields['workflow.$.needEscort'] = needEscort;
        }
        if (needTag) {
            additionalFields['workflow.$.needTag'] = needTag;
        }
        if (securityClearance && securityClearance >= 0 && securityClearance <= 5) {
            additionalFields['workflow.$.securityClearance'] = securityClearance;
        }

        return RequestModel.findOneAndUpdate(
            { 'workflow._id': taskId },
            Object.assign({
                'workflow.$.status': status,
                'workflow.$.lastChangeDate': new Date(),
                'workflow.$.authorizer': authorizerId,
            }, additionalFields), { new: true })
            .then((request: IRequest) => {
                if (request) {
                    let workflow: IRequestTask[] = request.workflow;
                    let status: TaskStatus = TaskStatus.PENDING;
                    let foundDenied: boolean = false;
                    let foundApproved: boolean = false;
                    let foundPending: boolean = false;

                    workflow.forEach(task => {
                        if (task.status === TaskStatus.DENIED) {
                            foundDenied = true;
                        } else if (task.status === TaskStatus.APPROVED) {
                            foundApproved = true;
                        } else {
                            foundPending = true;
                        }
                    });

                    if (foundDenied) {
                        status = TaskStatus.DENIED;
                    } else if (foundApproved && !foundPending) {
                        status = TaskStatus.APPROVED;
                    }
                    return RequestModel
                        .findOneAndUpdate({ _id: request._id }, { status: status }, { new: true })
                        .populate(populate);

                } else {
                    return Promise.resolve(null);
                }
            });
    }

    private convertOrganizationPermissionToFilter(organizationId: Types.ObjectId, permissions: PermissionType[]): Object {

        let canApproveSoldier = permissions.indexOf(PermissionType.APPROVE_SOLDIER) > -1;
        let canApproveCivilian = permissions.indexOf(PermissionType.APPROVE_CIVILIAN) > -1;
        let canApproveCar = permissions.indexOf(PermissionType.APPROVE_CAR) > -1;

        let soldierFilter = {
            'isSoldier': true,
            'workflow': {
                '$elemMatch': {
                    'type': TaskType.HUMAN,
                    'organization': organizationId,
                    'status': TaskStatus.PENDING
                }
            }
        };

        let civilianFilter = {
            'isSoldier': false,
            'workflow': {
                '$elemMatch': {
                    'type': TaskType.HUMAN,
                    'organization': organizationId,
                    'status': TaskStatus.PENDING
                }
            }
        };

        let carFilter = {
            'car': {
                $ne: CarType.NONE
            },
            'workflow': {
                '$elemMatch': {
                    'type': TaskType.CAR,
                    'organization': organizationId,
                    'status': TaskStatus.PENDING
                }
            }
        };

        let moreThenOnePermission = ((+canApproveCar) + (+canApproveCivilian) + (+canApproveSoldier)) > 1;
        if (moreThenOnePermission) {
            let filter = {
                $or: []
            };

            if (canApproveCar) filter.$or.push(carFilter);
            if (canApproveCivilian) filter.$or.push(civilianFilter);
            if (canApproveSoldier) filter.$or.push(soldierFilter);

            return filter;
        } else {
            if (canApproveCar) return carFilter;
            if (canApproveCivilian) return civilianFilter;
            if (canApproveSoldier) return soldierFilter;
        }

        return { noop: false };
    }

    public changeAllApprovableTasksStatus(user: IUser, requestId: Types.ObjectId, status: TaskStatus): Promise<void> {
        let userPermissions = user.permissions;
        let filter = [];

        userPermissions.forEach(permissions => {
            let filterObject = {
                'workflow.organization': permissions.organization._id,
                'workflow.status': TaskStatus.PENDING,
                'workflow.type': { $in: [] },

            };
            if (permissions.organizationPermissions.indexOf(PermissionType.APPROVE_CAR) !== -1) {
                filterObject['workflow.type'].$in.push(TaskType.CAR);
            }
            if (permissions.organizationPermissions.indexOf(PermissionType.APPROVE_SOLDIER) !== -1) {
                filterObject['workflow.type'].$in.push(TaskType.HUMAN);
                filterObject['isSoldier'] = true;
            }
            if (permissions.organizationPermissions.indexOf(PermissionType.APPROVE_CIVILIAN) !== -1) {
                filterObject['workflow.type'].$in.push(TaskType.HUMAN);
                if (filterObject['isSoldier']) {
                    delete filterObject['isSoldier']
                } else {
                    filterObject['isSoldier'] = false;
                }
            }

            filter.push(filterObject);
        });

        filter = [
            { $match: { _id: new Types.ObjectId(requestId) } },
            { $unwind: '$workflow' },
            { $match: { $or: filter } },
            { $project: { 'workflow._id': 1 } }
        ]
        return new Promise<void>((resolve, reject) => {
            RequestModel.aggregate(filter).exec().then(result => {
                result = result.map(res => res.workflow._id);

                return Promise.all(result.map(taskId => this.changeTaskStatus(user._id, taskId, status)));
            }).then(() => {
                resolve();
            }).catch(reject);
        });


    }
}