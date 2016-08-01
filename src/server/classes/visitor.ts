
export class Visitor {
    private _name: string;
    private _company: string;
    private _pid: number;

    constructor(name: string, company: string, pid: number) {
        this._name = name;
        this._company = company;
        this._pid = pid;
    }

    public get name(): string {
        return this._name;
    }

    public get pid(): number {
        return this._pid;
    }

    public get company(): string {
        return this._company;
    }
}
