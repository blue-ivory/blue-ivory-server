import { Organization } from './organization';
export class Task {
    public type: TaskType;
    public organization: Organization;
}

export enum TaskType {
    HUMAN = <any>'HUMAN',
    CAR = <any>'CAR'
}