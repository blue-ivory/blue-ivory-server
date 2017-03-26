import * as Promise from 'bluebird';
import { Document, Types } from 'mongoose';
import { UserModel } from './user.model';
import { RepositoryBase } from '../helpers/repository';
import { IUser } from './user.interface';
import { ICollection } from "../helpers/collection";
import { Organization } from "../organization/organization.class";
import { IOrganization } from "../organization/organization.interface";

export class UserRepository extends RepositoryBase<IUser> {
    constructor() {
        super(UserModel);
    }

    search(searchTerm?: string, paginationOptions?: { skip: number, limit: number }): Promise<ICollection<IUser>> {
        return new Promise<ICollection<IUser>>((resolve, reject) => {

            let searchFilter = this.generateNameFilter(searchTerm);
            let usersPromise = UserModel.find(searchFilter).populate('organization').populate('permissions.organization');

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
            }).catch(error => {
                reject(error);
            });
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

    setOrganization(userId: string, organizationId: Types.ObjectId):Promise<Document>{
        return new Promise<Document>((resolve, reject) => {
            Organization.findOrganization(organizationId).then((organization: IOrganization) => {
                let user = <IUser> {
                    _id: userId,
                    organization: organization
                };

                this.update(user, 'organization').then(resolve).catch(reject);
            }).catch(reject);
        });
    }
}