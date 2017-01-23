import { Permission } from './permission';
import { Organization } from './organization';

export class User {
    public firstName: string;
    public lastName: string;
    public _id: string;
    public mail: string;
    public organization: Organization;
    public permissions: [{ organization: Organization, permissions: Permission[] }];

    constructor(firstName: string, lastName: string, uniqueId: string, mail: string) {
        this.firstName = firstName;
        this.lastName = lastName;
        this._id = uniqueId;
        this.mail = mail;
    }

    public get name(): string {
        return this.firstName + ' ' + this.lastName;
    }
}