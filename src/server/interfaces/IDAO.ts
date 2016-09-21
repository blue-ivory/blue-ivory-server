// Data Access Object - create, read, update and delete generics
export interface IDAO<T> {
    all(): Promise<any>,
    create(t: T): Promise<any>;
    read(id): Promise<any>;
    update(t: T): Promise<any>;
    delete(id): Promise<void>;
}