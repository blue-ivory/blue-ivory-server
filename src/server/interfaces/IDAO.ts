// Data Access Object - create, read, update and delete generics
export interface IDAO<T> {
    create(t: T): T;
    read(id: number): T;
    update(t: T): boolean;
    delete(id: number): boolean;
}