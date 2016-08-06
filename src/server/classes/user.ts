
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
    public get getID(): string {
        return this._id;
    }
    
    public get getName(): string {
        return this.firstName + ' ' + this.lastName;
    }

    public get getMail(): string {
        return this.mail;
    }

    public get getBase(): string {
        return this.base;
    }

    /*
    * Setters
    */
    public set setBase(base: string) {
        this.base = base;
    }

    public set setMail(mail: string) {
        this.mail = mail;
    }
}