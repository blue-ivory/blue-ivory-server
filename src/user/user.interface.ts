import { Document } from 'mongoose';
import { PermissionType } from './../permission/permission.enum';
import { IOrganization } from './../classes/organization';

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    _id: string;
    mail: string;
    organization: IOrganization;
    permissions: [{ organization: IOrganization, organizationPermissions: PermissionType[] }];
    isAdmin: boolean;
}