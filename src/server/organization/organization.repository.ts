import * as Promise from 'bluebird';
import { RepositoryBase } from "../helpers/repository";
import { IOrganization } from "./organization.interface";
import { OrganizationModel } from "./organization.model";
import { ICollection } from "../helpers/collection";


export class OrganizationRepository extends RepositoryBase<IOrganization> {
    constructor() {
        super(OrganizationModel);
    }

    search(searchTerm: string, paginationOptions?: { skip: number, limit: number }): Promise<ICollection<IOrganization>> {
        return new Promise<ICollection<IOrganization>>((resolve, reject) => {
            let searchTermCaseInsensitiveRegex = new RegExp(searchTerm, 'i');

            let countPromise = OrganizationModel.count({ name: searchTermCaseInsensitiveRegex });
            let organizationsPromise = OrganizationModel.aggregate().match({ name: searchTermCaseInsensitiveRegex }).lookup({
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
                    set: <IOrganization[]>values[1]
                };

                resolve(result);
            }).catch(err => {
                reject(err);
            });
        });
    }
}