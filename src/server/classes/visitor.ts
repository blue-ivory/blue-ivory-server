
export class Visitor {
    private name: string;
    private company: string;
    private _id: number;

    constructor(name: string, company: string, _id: number) {
        this.name = name;
        this.company = company;
        this._id = _id;
    }

    public get getName(): string {
        return this.name;
    }

    public get getID(): number {
        return this._id;
    }

    public get getCompany(): string {
        return this.company;
    }
}
