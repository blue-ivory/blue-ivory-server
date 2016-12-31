import { Permission } from './permission';

export class User {
    public firstName: string;
    public lastName: string;
    public _id: string;
    public mail: string;
    public base: string;
    public permissions: Permission[];

    constructor(firstName?: string, lastName?: string, uniqueId?: string, mail?: string, base?: string, permissions?: Permission[]) {
        this.firstName = firstName;
        this.lastName = lastName;
        this._id = uniqueId;
        this.mail = mail;
        this.base = base;
        this.permissions = permissions;
    }

    public get name(): string {
        return this.firstName + ' ' + this.lastName;
    }
}