import { IUser } from './../user/user.interface';
import { IOrganization } from './../organization/organization.interface';
import { TaskStatus } from "../workflow/task-status.enum";
import { ITask } from "../workflow/task.interface";

export interface IRequestTask extends ITask {
    authorizer: IUser;
    lastChangeDate: Date;
    status: TaskStatus;
}