
export class Visitor {
    public name: string;
    public company: string;
    public _id: number;

    constructor(name: string, company: string, _id: number) {
        this.name = name;
        this.company = company;
        this._id = _id;
    }
}
