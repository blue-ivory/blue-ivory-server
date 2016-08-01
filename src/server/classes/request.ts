import { Visitor } from './visitor';
import { User } from './user';

export class Request  {
    private _requestDate: Date;
    private _startDate: Date;
    private _endDate: Date;
    private _visitor: Visitor;
    private _requestor: User;
    private _authorizer: User;
    private _description: string;
    private _isSolider: boolean;
    private _needEscort: boolean;
    private _hasCar: boolean;

    constructor(startDate: Date,
        endDate: Date,
        visitor: Visitor,
        requestor: User,
        description: string,
        isSoldier: boolean,
        needEscort: boolean,
        hasCar: boolean) {

        this._requestDate = new Date();
        this._startDate = startDate;
        this._endDate = endDate;
        this._visitor = visitor;
        this._requestor = requestor;
        this._authorizer = null;
        this._description = description;
        this._isSolider = isSoldier;
        this._needEscort = needEscort;
        this._hasCar = hasCar;
    }

    /*
    * Getters
    */
    public get requestDate(): Date {
        return this._requestDate;
    }

    public get startDate(): Date {
        return this._startDate;
    }

    public get visitor(): Visitor {
        return this._visitor;
    }

    public get requestor(): User {
        return this._requestor;
    }

    public get authorizer(): User {
        return this._authorizer;
    }

    public get description(): string {
        return this._description;
    }

    public get isSoldier(): boolean {
        return this._isSolider;
    }

    public get needEscort(): boolean {
        return this._needEscort;
    }

    public get hasCar(): boolean {
        return this._hasCar;
    }

    /*
    * Setters
    */
    public set startDate(startDate: Date) {
        this._startDate = startDate;
    }

    public set endDate(endDate: Date) {
        this._endDate = endDate;
    }

    public set authorizer(authorizer: User) {
        this._authorizer = authorizer;
    }

    public set description(description: string) {
        this._description = description;
    }
}