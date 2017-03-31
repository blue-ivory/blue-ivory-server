import { ITask } from './../classes/task';
import { IUser } from './../user/user.interface';
import { IOrganization } from './../organization/organization.interface';
import { TaskStatus } from "../workflow/task-status.enum";

export interface IRequestTask extends ITask {
    authorizer: IUser;
    lastChangeDate: Date;
    status: TaskStatus;
}