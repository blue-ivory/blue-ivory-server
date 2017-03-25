import * as Promise from 'bluebird';
import { Types, Document } from 'mongoose';
import { ICollection } from '../helpers/collection';
import { IOrganization } from "./organization.interface";
import { ITask } from "../classes/task";
import { OrganizationRepository } from "./organization.repository";

export class Organization {
    private _organization: IOrganization;
    private static _organizationRepository = new OrganizationRepository();

    constructor(organizationInterface: IOrganization) {
        this._organization = organizationInterface;
    }

    public get name(): string {
        return this._organization.name;
    }

    public get _id(): Types.ObjectId {
        return this._organization._id;
    }

    public get workflow(): ITask[] {
        return this._organization.workflow;
    }

    static createOrganization(name: string): Promise<Document> {
        let organization = <IOrganization>{
            name: name
        };

        return Organization._organizationRepository.create(organization);
    }

    static updateOrganization(organization: IOrganization): Promise<Document> {
        return Organization._organizationRepository.update(organization);
    }

    static findOrganization(id: Types.ObjectId): Promise<Document> {
        return Organization._organizationRepository.findById(id);
    }

    static searchOrganizations(searchTerm?: string, paginationOptions?: { skip: number, limit: number }): Promise<ICollection<IOrganization>> {
        return Organization._organizationRepository.search(searchTerm, paginationOptions);
    }
}