import { Task } from './task';
export class Workflow {
    public _id: any;
    public tasks: Task[];

    constructor() {
        this.tasks = [];
    }
}