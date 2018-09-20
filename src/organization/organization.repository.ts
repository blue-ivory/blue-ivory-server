import { ITask } from './../workflow/task.interface';
import { Types, Document } from 'mongoose';
import { RepositoryBase } from "../helpers/repository";
import { IOrganization } from "./organization.interface";
import { OrganizationModel } from "./organization.model";
import { ICollection } from "../helpers/collection";
import { IPaginationOptions } from "../pagination/pagination.interface";
import { TaskType } from "../workflow/task-type.enum";
import { UserModel } from "../user/user.model";
import { RequestModel } from "../request/request.model";


export class OrganizationRepository extends RepositoryBase<IOrganization> {
    constructor() {
        super(OrganizationModel);
    }

    async search(searchTerm: string, paginationOptions?: IPaginationOptions): Promise<ICollection<IOrganization>> {
        let searchTermCaseInsensitiveRegex = new RegExp(searchTerm, 'i');

        let countPromise = OrganizationModel.count({ name: searchTermCaseInsensitiveRegex });
        let organizationsPromise = OrganizationModel.find({ name: searchTermCaseInsensitiveRegex });
        // let organizationsPromise = OrganizationModel.aggregate().match({ name: searchTermCaseInsensitiveRegex }).lookup({
        //     from: "users",
        //     localField: "_id",
        //     foreignField: "organization",
        //     as: "users"
        // }).lookup({
        //     from: "requests",
        //     localField: "_id",
        //     foreignField: "organization",
        //     as: "requests"
        // }).project({
        //     name: 1,
        //     showRequests: 1,
        //     canCreateRequests: 1,
        //     users: { $size: "$users" },
        //     requests: { $size: "$requests" }
        // }).allowDiskUse(true);

        if (paginationOptions) {
            organizationsPromise = organizationsPromise.skip(paginationOptions.skip).limit(paginationOptions.limit);
        }

        let [organizations, count] = await Promise.all([organizationsPromise, countPromise]);

        const organizationIds = organizations.map((org: IOrganization) => org._id);

        const countForOrganization = await Promise.all(organizationIds.map(async id => {
            const userCount = await UserModel.count({ organization: id });
            const requestCount = await RequestModel.count({ organization: id });

            return {
                id,
                userCount,
                requestCount
            };
        }));

        organizations = organizations.map((organization: IOrganization) => {
            let orgData = countForOrganization.find(org => org.id.equals(organization._id));
            Object.assign(organization, { users: orgData.userCount, requests: orgData.requestCount });

            return organization;
        });

        let result = <ICollection<IOrganization>>{
            set: organizations,
            totalCount: count
        };

        return result;
    }

    async setWorkflow(organizationId: Types.ObjectId, workflow: ITask[]): Promise<Document> {

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
            } else { // current organization not in workflow. need to update every other organization
                workflow.forEach(task => {
                    if (task.type === TaskType.HUMAN) {
                        organizationsToUpdate.push(task.organization);
                    }
                });
            }

            await OrganizationModel.update({}, { $pull: { tags: organizationId } }, { multi: true }).exec();
            organizationsToUpdate = organizationsToUpdate.map(org => org._id);
            await OrganizationModel.update({ _id: { $in: organizationsToUpdate } }, { $addToSet: { tags: organizationId } }, { multi: true }).exec();
            return await this.update(organization);

        } else {
            return null;
        }

    }

    async getWorkflow(organizationId: Types.ObjectId): Promise<ITask[]> {
        let organization = <IOrganization>await this.findById(organizationId, { path: 'workflow.organization', select: 'name' });
        return organization ? organization.workflow : null;
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