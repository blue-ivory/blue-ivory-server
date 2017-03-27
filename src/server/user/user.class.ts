import * as Promise from 'bluebird';
import { Document, Types } from 'mongoose';
import { IUser } from './user.interface';
import { IOrganization } from '../classes/organization';
import { PermissionType } from '../permission/permission.enum';
import { UserRepository } from './user.repository';
import { ICollection } from "../helpers/collection";

export class User {

    private _user: IUser;
    private static _userRepository: UserRepository = new UserRepository();

    constructor(userInterface: IUser) {
        this._user = userInterface;
    }

    public get firstName(): string {
        return this._user.firstName;
    }

    public get lastName(): string {
        return this._user.lastName;
    }

    public get mail(): string {
        return this._user.mail;
    }

    public get organization(): IOrganization {
        return this._user.organization;
    }

    public get permissions(): [{ organization: IOrganization; organizationPermissions: PermissionType[]; }] {
        return this._user.permissions;
    }

    public get _id(): string {
        return this._user._id;
    }

    static createUser(firstName: string, lastName: string, uniqueId: string, mail: string): Promise<Document> {

        let user = <IUser>{
            firstName: firstName,
            lastName: lastName,
            _id: uniqueId,
            mail: mail
        }

        return User._userRepository.create(user);
    }

    static findUser(id: string, populateField?: string): Promise<Document> {
        return User._userRepository.findById(id, 'organization ' + populateField);
    }

    static updateUser(user: IUser): Promise<Document> {
        return User._userRepository.update(user, 'organization');
    }

    static deleteUser(id: string): Promise<void> {
        return User._userRepository.delete(id);
    }

    static searchUsers(searchTerm?: string, paginationOptions?: { skip: number, limit: number }): Promise<ICollection<IUser>> {
        return User._userRepository.search(searchTerm, paginationOptions);
    }

    static setOrganization(userId: string, organizationId: Types.ObjectId): Promise<Document> {
        return User._userRepository.setOrganization(userId, organizationId);
    }

    static setPermissions(userId: string, organizationId: Types.ObjectId, permissions: PermissionType[]): Promise<Document> {
        return User._userRepository.setPermissions(userId, organizationId, permissions);
    }
}