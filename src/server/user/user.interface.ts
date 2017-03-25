import { Document } from 'mongoose';
import { Permission } from './../classes/permission';
import { IOrganization } from './../classes/organization';

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    _id: string;
    mail: string;
    organization: IOrganization;
    permissions: [{ organization: IOrganization, organizationPermissions: Permission[] }];
    isAdmin: boolean;
}