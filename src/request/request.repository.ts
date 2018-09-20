import { Types } from "mongoose";
import { RepositoryBase } from "../helpers/repository";
import { IPaginationOptions } from "../pagination/pagination.interface";
import { PermissionType } from "../permission/permission.enum";
import { IUser } from "../user/user.interface";
import { TaskStatus } from "../workflow/task-status.enum";
import { TaskType } from "../workflow/task-type.enum";
import { ICollection } from './../helpers/collection';
import { Organization } from './../organization/organization.class';
import { IOrganization } from './../organization/organization.interface';
import { Visitor } from './../visitor/visitor.class';
import { IVisitor } from './../visitor/visitor.interface';
import { IRequestTask } from './request-task.interface';
import { CarType, IRequest } from "./request.interface";
import { RequestModel } from './request.model';

export class RequestRepository extends RepositoryBase<IRequest> {
    constructor() {
        super(RequestModel);
    }

    public async search(searchTerm?: string, paginationOptions?: IPaginationOptions, filter?: Object): Promise<ICollection<IRequest>> {
        searchTerm = searchTerm ? searchTerm.replace(/[^\s\w\d\u0590-\u05FF]/gi, '') : '';
        let visitorsCollection: ICollection<IVisitor> = await Visitor.searchVisitors(searchTerm);
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

        let requestPromise = RequestModel.find(queryFilter).sort({ requestDate: -1 }).populate(populateFields).select('startDate endDate visitor organization car isSoldier status requestDate');
        let countPromise = RequestModel.count(queryFilter);

        if (paginationOptions) {
            requestPromise = requestPromise
                .skip(paginationOptions.skip)
                .limit(paginationOptions.limit);
        }

        let [requests, count] = await Promise.all([requestPromise, countPromise]);
        let result = {
            set: requests,
            totalCount: count
        };

        return result;
    }

    public searchMy(user: IUser, searchTerm?: string, paginationOptions?: IPaginationOptions): Promise<ICollection<IRequest>> {
        let filter = {
            requestor: user ? user._id : null
        };

        return this.search(searchTerm, paginationOptions, filter);
    }

    public searchPending(user: IUser, searchTerm?: string, paginationOptions?: IPaginationOptions): Promise<ICollection<IRequest>> {
        let date = new Date();
        date.setDate(date.getDate() - 1);

        let filter: any = {
            $and: [
                {
                    'endDate': {
                        $gte: date
                    },
                    'status': TaskStatus.PENDING
                },
                {
                    $or: []
                }
            ],
            // $or: []
        }

        if (user && user.permissions && user.permissions.length > 0) {
            user.permissions.forEach(permission => {
                filter.$and[1].$or.push(this.convertOrganizationPermissionToFilter(permission.organization._id, permission.organizationPermissions));
                // filter.$or.push(this.convertOrganizationPermissionToFilter(permission.organization._id, permission.organizationPermissions));
            })

            if (filter.$and[1].$or.length < 2) {
                // if (filter.$or.length < 2) {
                filter.$and[1] = filter.$and[1].$or[0];
                // filter = filter.$or[0];
            }
        } else {
            filter = { noop: false };
        }

        return this.search(searchTerm, paginationOptions, filter);
    }

    public async searchCivilian(user: IUser, searchTerm?: string, paginationOptions?: IPaginationOptions): Promise<ICollection<IRequest>> {
        let viewableOrgs = await this.getViewableOrganizations(user);

        let filter = {
            organization: { $in: viewableOrgs },
            isSoldier: false
        };

        // if (user && user.organization) {
        //     let org = <IOrganization>await Organization.findOrganization(user.organization._id);
        //     let tags = org.tags.map(tag => tag._id);

        //     filter['organization'] = {
        //         $in: tags.concat(user.organization._id)
        //     };
        // }

        return this.search(searchTerm, paginationOptions, filter);
    }

    public async searchSoldier(user: IUser, searchTerm?: string, paginationOptions?: IPaginationOptions): Promise<ICollection<IRequest>> {
        let viewableOrgs = await this.getViewableOrganizations(user);

        let filter = {
            organization: { $in: viewableOrgs },
            isSoldier: true
        };

        // if (user && user.organization) {
        //     let org = <IOrganization>await Organization.findOrganization(user.organization._id);
        //     let tags = org.tags.map(tag => tag._id)
        //         // .filter(org => viewableOrgs.some(_org => org.equals(_org)));

        //     filter['organization'] = {
        //         $in: tags.concat(user.organization._id)
        //     };
        // }

        return this.search(searchTerm, paginationOptions, filter);
    }

    public async searchAll(user: IUser, searchTerm?: string, paginationOptions?: IPaginationOptions): Promise<ICollection<IRequest>> {
        if (user && user.organization) {
            let org = <IOrganization>await Organization.findOrganization(user.organization._id);

            /*****************************/
            // let viewableOrgs = org.tags.map((tag: IOrganization) => {
            //     return {
            //         _id: tag._id,
            //         showRequests: tag.showRequests
            //     };
            // });

            // viewableOrgs.push({ _id: org._id, showRequests: org.showRequests });
            // viewableOrgs = viewableOrgs.filter((tag) => {
            //     let orgPermissions = user.permissions.find(perm => perm.organization._id.equals(tag._id));
            //     if (orgPermissions) {
            //         return (orgPermissions.organizationPermissions.indexOf(PermissionType.VIEW_REQUESTS) !== -1) || tag.showRequests;
            //     }

            //     return tag.showRequests;
            // });
            // viewableOrgs.map(tag => tag._id);

            // if (viewableOrgs.length === 0) {
            //     return null;
            // }

            // let filter = {
            //     organization: { $in: viewableOrgs }
            // };
            let viewableOrgs = await this.getViewableOrganizations(user);

            let filter = {
                organization: { $in: viewableOrgs }
            };

            return await this.search(searchTerm, paginationOptions, filter);
        } else {
            return null;
        }
    }

    private async getViewableOrganizations(user: IUser) {
        let viewableOrgs = [];
        if (user && user.organization) {
            let org = <IOrganization>await Organization.findOrganization(user.organization._id);

            viewableOrgs = org.tags.map((tag: IOrganization) => {
                return {
                    _id: tag._id,
                    showRequests: tag.showRequests
                };
            });

            viewableOrgs.push({ _id: org._id, showRequests: org.showRequests });
            viewableOrgs = viewableOrgs.filter((tag) => {
                let orgPermissions = user.permissions.find(perm => perm.organization._id.equals(tag._id));
                if (orgPermissions) {
                    return (orgPermissions.organizationPermissions.indexOf(PermissionType.VIEW_REQUESTS) !== -1) || tag.showRequests;
                }

                return tag.showRequests;
            });
            viewableOrgs.map(tag => tag._id);
        }

        return viewableOrgs;
    }

    public async changeTaskStatus(authorizerId: string,
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

        let request: IRequest = await RequestModel.findOneAndUpdate(
            { 'workflow._id': taskId },
            Object.assign({
                'workflow.$.status': status,
                'workflow.$.lastChangeDate': new Date(),
                'workflow.$.authorizer': authorizerId,
            }, additionalFields), { new: true });
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
            return await RequestModel
                .findOneAndUpdate({ _id: request._id }, { status: status }, { new: true })
                .populate(populate);

        } else {
            return null;
        }
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

    public async changeAllApprovableTasksStatus(user: IUser, requestId: Types.ObjectId, status: TaskStatus): Promise<void> {
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

        let result = await RequestModel.aggregate(filter).exec();
        result = result.map(res => res.workflow._id);
        await Promise.all(result.map(taskId => this.changeTaskStatus(user._id, taskId, status)));
    }
}