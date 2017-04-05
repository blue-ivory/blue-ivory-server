import { ITask } from './../workflow/task.interface';
import * as Promise from 'bluebird';
import { Types, Document } from 'mongoose';
import { ICollection } from '../helpers/collection';
import { IOrganization } from "./organization.interface";
import { OrganizationRepository } from "./organization.repository";
import { IPaginationOptions } from "../pagination/pagination.interface";

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

    static searchOrganizations(searchTerm?: string, paginationOptions?: IPaginationOptions): Promise<ICollection<IOrganization>> {
        return Organization._organizationRepository.search(searchTerm, paginationOptions);
    }

    static setWorkflow(organizationId: Types.ObjectId, workflow: ITask[]): Promise<Document> {
        return Organization._organizationRepository.setWorkflow(organizationId, workflow);
    }

    static getWorkflow(organizationId: Types.ObjectId): Promise<ITask[]> {
        return Organization._organizationRepository.getWorkflow(organizationId);
    }

    static getRequestableOrganization(): Promise<Document[]> {
        return Organization._organizationRepository.find({
            $and:
            [
                { workflow: { $ne: null } },
                { workflow: { $ne: [] } }
            ]
        }, null, 'name');
    }
}