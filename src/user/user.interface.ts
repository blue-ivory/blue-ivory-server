import { Document } from 'mongoose';
import { IOrganization } from "../organization/organization.interface";
import { PermissionType } from './../permission/permission.enum';

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    _id: string;
    mail: string;
    organization: IOrganization;
    permissions: [{ organization: IOrganization, organizationPermissions: PermissionType[] }];
    isAdmin: boolean;
    phoneNumber: string;
}