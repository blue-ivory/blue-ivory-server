import { Document, Types } from 'mongoose';
import { ICollection } from '../helpers/collection';
import { IPaginationOptions } from "../pagination/pagination.interface";
import { ITask } from './../workflow/task.interface';
import { IOrganization } from "./organization.interface";
import { OrganizationRepository } from "./organization.repository";

export class Organization {
    private static _organizationRepository = new OrganizationRepository();

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
        return Organization._organizationRepository.findById(id, { path: 'tags', select: 'showRequests canCreateRequests' });
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
        }, null, 'name canCreateRequests');
    }
}