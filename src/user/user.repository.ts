import { User } from './user.class';
import * as Promise from 'bluebird';
import { Document, Types } from 'mongoose';
import { UserModel } from './user.model';
import { RepositoryBase } from '../helpers/repository';
import { IUser } from './user.interface';
import { ICollection } from "../helpers/collection";
import { Organization } from "../organization/organization.class";
import { IOrganization } from "../organization/organization.interface";
import { PermissionType } from "../permission/permission.enum";
import { IPaginationOptions } from "../pagination/pagination.interface";

export class UserRepository extends RepositoryBase<IUser> {
    constructor() {
        super(UserModel);
    }

    search(searchTerm?: string, paginationOptions?: IPaginationOptions): Promise<ICollection<IUser>> {
        return new Promise<ICollection<IUser>>((resolve, reject) => {

            let searchFilter = this.generateNameFilter(searchTerm);
            let usersPromise = UserModel.find(searchFilter)
                .populate({ path: 'organization', select: 'name' }).select('firstName lastName mail organization');

            if (paginationOptions) {
                usersPromise = usersPromise
                    .skip(paginationOptions.skip)
                    .limit(paginationOptions.limit);
            }

            let countPromise = UserModel.count(searchFilter);

            Promise.all([usersPromise, countPromise]).then(values => {
                let result = {
                    set: values[0],
                    totalCount: values[1]
                };

                resolve(result);
            }).catch(reject);
        });
    }

    private generateNameFilter(searchTerm: string): Object {

        let searchTermCaseInsensitiveRegex = new RegExp(searchTerm, 'i');
        let basicFilter = [
            {
                _id: searchTermCaseInsensitiveRegex // got uniqueId
            },
            {
                $or: [{
                    firstName: searchTermCaseInsensitiveRegex
                }, {
                    lastName: searchTermCaseInsensitiveRegex
                }]
            }
        ];

        let advancedFilter = [];

        if (searchTerm && searchTerm.indexOf(' ') !== -1) {
            let splittedValues: string[] = searchTerm.split(' ');
            let firstValue: RegExp = new RegExp(splittedValues[0], 'i');
            let secondValue: RegExp = new RegExp(splittedValues[1], 'i');

            advancedFilter.push(
                {
                    $and: [
                        { firstName: firstValue },
                        { lastName: secondValue }
                    ]
                }, {
                    $and: [
                        { firstName: secondValue },
                        { lastName: firstValue }
                    ]
                });
        }


        return {
            $or: basicFilter.concat(advancedFilter)
        };
    }

    setOrganization(userId: string, organizationId: Types.ObjectId): Promise<Document> {
        return new Promise<Document>((resolve, reject) => {
            Organization.findOrganization(organizationId).then((organization: IOrganization) => {
                let user = <IUser>{
                    _id: userId,
                    organization: organization
                };

                this.update(user, 'organization').then(resolve).catch(reject);
            }).catch(reject);
        });
    }

    setPermissions(userId: string, organizationId: Types.ObjectId, permissions: PermissionType[]): Promise<IUser> {
        return new Promise<IUser>((resolve, reject) => {
            Promise.all([
                this.findById(userId, 'organization permissions.organization'),
                Organization.findOrganization(organizationId)
            ]).then(values => {
                let user = <IUser>values[0];
                let organization = <IOrganization>values[1];

                if (!user || !organization) {
                    reject('User or organization not found');
                } else {
                    let uniquePermissions = Array.from(new Set(permissions));
                    let organizationPermissionsExists: boolean = false;
                    user.permissions.forEach(permission => {
                        if (permission.organization._id.equals(organization._id)) {
                            organizationPermissionsExists = true;
                        }
                    });

                    let organizationPermissions = { organization: organization, organizationPermissions: uniquePermissions };
                    let updateFilter = {
                        _id: userId
                    };

                    if (uniquePermissions.length > 0 && organizationPermissionsExists) {
                        updateFilter['permissions.organization'] = organization._id;
                    }

                    let updateValue = {};

                    if (uniquePermissions.length === 0) {
                        updateValue['$pull'] = {
                            'permissions': {
                                'organization': organization._id
                            }
                        };
                    } else {
                        if (organizationPermissionsExists) {
                            updateValue['$set'] = {
                                'permissions.$.organizationPermissions': uniquePermissions
                            };
                        } else {
                            updateValue['$push'] = {
                                permissions: organizationPermissions
                            }
                        }
                    }

                    resolve(UserModel.findOneAndUpdate(updateFilter, updateValue, { new: true }).populate('organization permissions.organization'));
                }

            }).catch(reject);
        });
    }

    getApprovableUsersByOrganization(organizationId: Types.ObjectId, isSoldier: boolean, hasCar: boolean): Promise<IUser[]> {
        let requiredPermissions = [];
        requiredPermissions.push(isSoldier ? PermissionType.APPROVE_SOLDIER : PermissionType.APPROVE_CIVILIAN);
        if (hasCar) {
            requiredPermissions.push(PermissionType.APPROVE_CAR);
        }

        let filter = {
            permissions:
            {
                $elemMatch:
                {
                    organization: organizationId,
                    organizationPermissions: {
                        $in: requiredPermissions
                    }
                }
            }
        }

        return UserModel.find(filter).exec();
    }
}