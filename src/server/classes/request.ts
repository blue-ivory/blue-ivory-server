import { Visitor } from './visitor';
import { User } from './user';

export class Request {
    public _id;
    public requestDate: Date;
    public startDate: Date;
    public endDate: Date;
    public visitor: Visitor;
    public requestor: User;
    public authorizer: User;
    public description: string;
    public isSolider: boolean;
    public needEscort: boolean;
    public hasCar: boolean;

    constructor(
        startDate: Date,
        endDate: Date,
        visitor: Visitor,
        requestor: User,
        description: string,
        isSoldier: boolean,
        needEscort: boolean,
        hasCar: boolean) {
        
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
}