import { Document } from 'mongoose';
import { Permission } from './permission';
import { IOrganization } from './organization';

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    _id: string;
    mail: string;
    organization: IOrganization;
    permissions: [{ organization: IOrganization, organizationPermissions: Permission[] }];
    isAdmin: boolean;
}