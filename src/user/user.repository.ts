import { Document, Types } from 'mongoose';
import { ICollection } from "../helpers/collection";
import { RepositoryBase } from '../helpers/repository';
import { Organization } from "../organization/organization.class";
import { IOrganization } from "../organization/organization.interface";
import { IPaginationOptions } from "../pagination/pagination.interface";
import { PermissionType } from "../permission/permission.enum";
import { IUser } from './user.interface';
import { UserModel } from './user.model';

export class UserRepository extends RepositoryBase<IUser> {
    constructor() {
        super(UserModel);
    }

    async search(searchTerm?: string, paginationOptions?: IPaginationOptions): Promise<ICollection<IUser>> {

        let searchFilter = this.generateNameFilter(searchTerm);
        let usersPromise = UserModel.find(searchFilter)
            .populate({ path: 'organization', select: 'name' }).select('firstName lastName mail organization');

        if (paginationOptions) {
            usersPromise = usersPromise
                .skip(paginationOptions.skip)
                .limit(paginationOptions.limit);
        }

        let countPromise = UserModel.count(searchFilter);

        let [users, count] = await Promise.all([usersPromise, countPromise]);
        let result = <ICollection<IUser>>{
            set: users,
            totalCount: count
        };

        return result;
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

    async setOrganization(userId: string, organizationId: Types.ObjectId): Promise<Document> {
        let organization = await Organization.findOrganization(organizationId);
        let user = <IUser>{
            _id: userId,
            organization: organization
        };

        return await this.update(user, 'organization');
    }

    async setPermissions(userId: string, organizationId: Types.ObjectId, permissions: PermissionType[]): Promise<IUser> {
        let user = <IUser>await this.findById(userId, 'organization permissions.organization');
        let organization = <IOrganization>await Organization.findOrganization(organizationId);

        if (!user || !organization) {
            throw new Error('User or organization not found');
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

            return await UserModel.findOneAndUpdate(updateFilter, updateValue, { new: true }).populate('organization permissions.organization');
        }
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

        return UserModel.find(filter).select('firstName lastName mail').exec();
    }
}