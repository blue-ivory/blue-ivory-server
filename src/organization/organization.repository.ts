import { ITask } from './../workflow/task.interface';
import { Types, Document } from 'mongoose';
import * as Promise from 'bluebird';
import { RepositoryBase } from "../helpers/repository";
import { IOrganization } from "./organization.interface";
import { OrganizationModel } from "./organization.model";
import { ICollection } from "../helpers/collection";
import { IPaginationOptions } from "../pagination/pagination.interface";
import { TaskType } from "../workflow/task-type.enum";


export class OrganizationRepository extends RepositoryBase<IOrganization> {
    constructor() {
        super(OrganizationModel);
    }

    search(searchTerm: string, paginationOptions?: IPaginationOptions): Promise<ICollection<IOrganization>> {
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

    setWorkflow(organizationId: Types.ObjectId, workflow: ITask[]): Promise<Document> {

        if (workflow) {

            let organization = <IOrganization>{
                _id: organizationId,
                workflow: workflow ? this.getUniqueTasks(workflow) : workflow
            }

            let organizationsToUpdate = [];
            let tags = [];

            let currentOrganizationIndex = workflow.findIndex(task => {
                return task.organization._id == organizationId && task.type === TaskType.HUMAN;
            });

            if (currentOrganizationIndex !== -1) {
                workflow.forEach(task => {
                    if (task.order > workflow[currentOrganizationIndex].order && task.type === TaskType.HUMAN) {
                        tags.push(task.organization._id);
                    } else if (task.order < workflow[currentOrganizationIndex].order && task.type === TaskType.HUMAN) {
                        organizationsToUpdate.push(task.organization);
                    }
                });
            }

            return OrganizationModel.update({}, { $pull: { tags: { _id: organizationId } } }, { multi: true }).exec().then(() => {
                organizationsToUpdate = organizationsToUpdate.map(org => org._id);
                return OrganizationModel.update({ _id: { $in: organizationsToUpdate } }, { $addToSet: { tags: { _id: organizationId } } }, { multi: true }).exec();
            }).then(() => {
                return this.update(organization);
            });
        } else {
            return Promise.resolve(null);
        }

    }

    getWorkflow(organizationId: Types.ObjectId): Promise<ITask[]> {
        return new Promise<ITask[]>((resolve, reject) => {
            this.findById(organizationId, { path: 'workflow.organization', select: 'name' }).then((organization: IOrganization) => {
                resolve(organization ? organization.workflow : null);
            }).catch(reject);
        });
    }

    private getUniqueTasks(workflow: ITask[]): ITask[] {
        let uniqueTasks: ITask[] = [];

        workflow.forEach((firstTask: ITask) => {
            let exists: boolean = false;
            uniqueTasks.forEach((secondTask: ITask) => {
                if (secondTask.organization._id === firstTask.organization._id && secondTask.type === firstTask.type) {
                    exists = true;
                }
            });
            if (!exists) {
                uniqueTasks.push(firstTask);
            }
        });

        return uniqueTasks;
    }
}