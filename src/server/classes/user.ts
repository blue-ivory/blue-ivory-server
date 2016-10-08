
export class User {
    public firstName: string;
    public lastName: string;
    public _id: string;
    public mail: string;
    public base: string;
    public roles: Array<string>;

    constructor(firstName?: string, lastName?: string, uniqueId?: string, mail?: string, base?: string, roles?: Array<string>) {
        this.firstName = firstName;
        this.lastName = lastName;
        this._id = uniqueId;
        this.mail = mail;
        this.base = base;
        this.roles = roles;
    }

    public get name(): string {
        return this.firstName + ' ' + this.lastName;
    }
}