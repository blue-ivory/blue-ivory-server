import { IOrganization } from './../organization/organization.interface';
import { TaskType } from "./task-type.enum";

export interface ITask {
    type: TaskType;
    organization: IOrganization;
    order: number;
}
