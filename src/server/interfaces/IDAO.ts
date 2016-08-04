// Data Access Object - create, read, update and delete generics
export interface IDAO<T> {
    all(callback: Function): void,
    create(t: T, callback: Function): void;
    read(id, callback: Function): void;
    update(t: T, callback: Function): void;
    delete(id, callback: Function): void;
}