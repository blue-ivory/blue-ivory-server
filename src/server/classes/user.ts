
export class User {
    private firstName: string;
    private lastName: string;
    private _id: string;
    private mail: string;
    private base: string;

    constructor(firstName: string, lastName: string, uniqueId: string, mail: string, base: string) {
        this.firstName = firstName;
        this.lastName = lastName;
        this._id = uniqueId;
        this.mail = mail;
        this.base = base;
    }

    /*
    * Getters
    */
    public get name(): string {
        return this.firstName + ' ' + this.lastName;
    }

    // public get mail(): string {
    //     return this.mail;
    // }

    // public get base(): string {
    //     return this.base;
    // }

    /*
    * Setters
    */
    // public set base(base: string) {
    //     this.base = base;
    // }
}