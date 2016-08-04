import { Visitor } from './visitor';
import { User } from './user';

export class Request {
    private _id;
    private requestDate: Date;
    private startDate: Date;
    private endDate: Date;
    private visitor: Visitor;
    private requestor: User;
    private authorizer: User;
    private description: string;
    private isSolider: boolean;
    private needEscort: boolean;
    private hasCar: boolean;

    constructor(_id,
        startDate: Date,
        endDate: Date,
        visitor: Visitor,
        requestor: User,
        description: string,
        isSoldier: boolean,
        needEscort: boolean,
        hasCar: boolean) {
        
        this._id = _id;
        this.requestDate = new Date();
        this.startDate = startDate;
        this.endDate = endDate;
        this.visitor = visitor;
        this.requestor = requestor;
        this.authorizer = null;
        this.description = description;
        this.isSolider = isSoldier;
        this.needEscort = needEscort;
        this.hasCar = hasCar;
    }

    /*
    * Getters
    */
    public get getID() {
        return this._id;
    }
    public get getRequestDate(): Date {
        return this.requestDate;
    }

    public get getStartDate(): Date {
        return this.startDate;
    }

    public get getVisitor(): Visitor {
        return this.visitor;
    }

    public get getRequestor(): User {
        return this.requestor;
    }

    public get getAuthorizer(): User {
        return this.authorizer;
    }

    public get getDescription(): string {
        return this.description;
    }

    public get getIsSoldier(): boolean {
        return this.isSolider;
    }

    public get getNeedEscort(): boolean {
        return this.needEscort;
    }

    public get getHasCar(): boolean {
        return this.hasCar;
    }

    /*
    * Setters
    */
    public set setStartDate(startDate: Date) {
        this.startDate = startDate;
    }

    public set setEndDate(endDate: Date) {
        this.endDate = endDate;
    }

    public set setAuthorizer(authorizer: User) {
        this.authorizer = authorizer;
    }

    public set setDescription(description: string) {
        this.description = description;
    }
}