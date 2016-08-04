export class Base {
    private name: string;

    constructor(name: string) {
        this.name = name;
    }

    /*
    * Getters
    */
    public get getName(): string {
        return this.name;
    }

    /*
    * Setters
    */
    public set setName(name: string) {
        this.name = name;
    }
}