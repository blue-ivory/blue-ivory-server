import { expect } from 'chai';
import { Organization } from './../organization/organization.class';
import { IOrganization } from './../organization/organization.interface';
import { User } from './../user/user.class';
import { IUser } from './../user/user.interface';
import { Permission } from './permission.class';
import { PermissionType } from "./permission.enum";

describe('Permission', () => {
    describe('#hasPermissions', () => {

        let user = <IUser>null;

        beforeEach(async () => {
            let organization1 = await Organization.createOrganization('org1');
            let organization2 = await Organization.createOrganization('org2');

            user = <IUser>await User.createUser('Ron', 'Borysovski', '123456', 'roni537@gmail.com');

            await User.setPermissions(user._id, organization1._id, [PermissionType.EDIT_USER_PERMISSIONS]);
            await User.setPermissions(user._id, organization2._id, [PermissionType.APPROVE_SOLDIER]);
        });

        it('Should return false when user not exists', async () => {
            let hasPermissions = await Permission.hasPermissions('notExistingUser', [PermissionType.EDIT_WORKFLOW]);
            expect(hasPermissions).to.be.false;
        });

        it('Should return true when no permissions required', async () => {
            let values = await Promise.all([
                Permission.hasPermissions(user._id, []),
                Permission.hasPermissions(user._id, [], true)
            ]);

            expect(values).to.exist
                .and.be.an('array')
                .and.have.length(2).and.to.satisfy((values: boolean[]) => {
                    values.forEach(v => expect(v).to.be.true);

                    return true;
                });
        });

        it('Should return false if user don\'t have required permissions', async () => {
            let values = await Promise.all([
                Permission.hasPermissions(user._id, [PermissionType.APPROVE_CAR]),
                Permission.hasPermissions(user._id, [PermissionType.APPROVE_CAR, PermissionType.EDIT_WORKFLOW]),
                Permission.hasPermissions(user._id, [PermissionType.APPROVE_CIVILIAN, PermissionType.EDIT_USER_PERMISSIONS]),
                Permission.hasPermissions(user._id, [PermissionType.APPROVE_CIVILIAN, PermissionType.EDIT_WORKFLOW], true)
            ]);
            expect(values).to.exist
                .and.to.be.an('array')
                .and.to.have.length(4)
                .and.to.satisfy((values: boolean[]) => {
                    values.forEach(value => expect(value).to.be.false);

                    return true;
                });
        });

        it('Should return true when user has the required permissions', async () => {
            let values = await Promise.all([
                Permission.hasPermissions(user._id, [PermissionType.EDIT_USER_PERMISSIONS]),
                Permission.hasPermissions(user._id, [PermissionType.APPROVE_SOLDIER]),
                Permission.hasPermissions(user._id, [PermissionType.APPROVE_SOLDIER], true),
                Permission.hasPermissions(user._id, [PermissionType.EDIT_USER_PERMISSIONS, PermissionType.APPROVE_SOLDIER]),
                Permission.hasPermissions(user._id, [PermissionType.EDIT_USER_PERMISSIONS, PermissionType.APPROVE_SOLDIER], true),
                Permission.hasPermissions(user._id, [PermissionType.APPROVE_SOLDIER, PermissionType.APPROVE_CIVILIAN], true),
            ]);
            expect(values).to.exist
                .and.to.be.an('array')
                .and.to.have.length(6)
                .and.to.satisfy((values: boolean[]) => {
                    values.forEach(value => expect(value).to.be.true);

                    return true;
                });
        });

        it('Should return false when user don\'t have enough permissions', async () => {
            let values = await Promise.all([
                Permission.hasPermissions(user._id, [PermissionType.APPROVE_CAR]),
                Permission.hasPermissions(user._id, [PermissionType.APPROVE_SOLDIER, PermissionType.APPROVE_CAR]),
                Permission.hasPermissions(user._id, [PermissionType.APPROVE_CAR, PermissionType.APPROVE_CIVILIAN, PermissionType.EDIT_WORKFLOW], true),
                Permission.hasPermissions(user._id, [PermissionType.APPROVE_CAR, PermissionType.EDIT_USER_PERMISSIONS, PermissionType.EDIT_WORKFLOW])
            ]);
            expect(values).to.exist
                .and.to.be.an('array')
                .and.to.have.length(4)
                .and.to.satisfy((values: boolean[]) => {
                    values.forEach(value => expect(value).to.be.false);

                    return true;
                });
        });

        it('Should return true when user is admin no metter what permissions required', async () => {
            user.isAdmin = true;
            let _user = await User.updateUser(user);
            expect(_user).to.exist;
            expect(_user).to.have.property('isAdmin', true);

            let values = await Promise.all([
                Permission.hasPermissions(_user._id, [PermissionType.APPROVE_CAR]),
                Permission.hasPermissions(_user._id, [PermissionType.APPROVE_CIVILIAN]),
                Permission.hasPermissions(_user._id, [PermissionType.APPROVE_SOLDIER]),
                Permission.hasPermissions(_user._id, [PermissionType.EDIT_USER_PERMISSIONS]),
                Permission.hasPermissions(_user._id, [PermissionType.EDIT_WORKFLOW]),
                Permission.hasPermissions(_user._id, [PermissionType.DELETE_REQUEST]),
                Permission.hasPermissions(_user._id, [
                    PermissionType.APPROVE_CAR,
                    PermissionType.APPROVE_CIVILIAN,
                    PermissionType.APPROVE_SOLDIER,
                    PermissionType.EDIT_USER_PERMISSIONS,
                    PermissionType.EDIT_WORKFLOW,
                    PermissionType.DELETE_REQUEST
                ])]);
            expect(values).to.exist
                .and.to.be.an('array')
                .and.to.have.length(7)
                .and.to.satisfy((values: boolean[]) => {
                    values.forEach(value => expect(value).to.be.true);

                    return true;
                });
        });
    });

    describe('#hasPermissionsForOrganization', () => {

        let user = <IUser>null;
        let organization1 = <IOrganization>null;
        let organization2 = <IOrganization>null;

        beforeEach(async () => {
            organization1 = <IOrganization>await Organization.createOrganization('org1');
            organization2 = <IOrganization>await Organization.createOrganization('org2');

            user = <IUser>await User.createUser('Ron', 'Borysovski', '123456', 'roni537@gmail.com');
            user = <IUser>await User.setPermissions(user._id, organization1._id, [PermissionType.EDIT_USER_PERMISSIONS]);
            user = <IUser>await User.setPermissions(user._id, organization2._id, [PermissionType.APPROVE_SOLDIER]);
        });

        it('Should return false when user not found', async () => {
            let values = await Promise.all([
                Permission.hasPermissionForOrganization('NotExistingUser', [], null),
                Permission.hasPermissionForOrganization('NotExistingUser', [], null, true),
                Permission.hasPermissionForOrganization('NotExistingUser', [PermissionType.APPROVE_SOLDIER], null),
                Permission.hasPermissionForOrganization('NotExistingUser', [PermissionType.APPROVE_SOLDIER], null, true),
            ]);
            expect(values).to.exist;
            expect(values).to.be.an('array')
                .and.to.satisfy((values: boolean[]) => {
                    values.forEach(value => expect(value).to.be.false);

                    return true;
                });
        });

        it('Should return true when no permissions required', async () => {
            let values = await Promise.all([
                Permission.hasPermissionForOrganization(user._id, [], organization1._id),
                Permission.hasPermissionForOrganization(user._id, [], organization1._id, true),
                Permission.hasPermissionForOrganization(user._id, [], organization2._id),
                Permission.hasPermissionForOrganization(user._id, [], organization2._id, true),
            ]);
            expect(values).to.exist;
            expect(values).to.be.an('array')
                .and.to.satisfy((values: boolean[]) => {
                    values.forEach(value => expect(value).to.be.true);

                    return true;
                });
        });

        it('Should return false when user don\'t have required permissions', async () => {
            let hasPermissions = await Promise.all([
                Permission.hasPermissionForOrganization(user._id, [PermissionType.APPROVE_SOLDIER], organization1._id),
                Permission.hasPermissionForOrganization(user._id, [PermissionType.EDIT_USER_PERMISSIONS], organization2._id, true),
                Permission.hasPermissionForOrganization(user._id, [PermissionType.EDIT_WORKFLOW, PermissionType.APPROVE_CIVILIAN], organization2._id, true),
                Permission.hasPermissionForOrganization(user._id, [PermissionType.EDIT_USER_PERMISSIONS, PermissionType.APPROVE_CAR], organization1._id),
                Permission.hasPermissionForOrganization(user._id, [PermissionType.EDIT_USER_PERMISSIONS, PermissionType.APPROVE_SOLDIER], organization2._id)
            ])
            hasPermissions.forEach(hasPermission => {
                expect(hasPermission).to.be.false;
            });
        });

        it('Should return false when user has required permissions but not for the required organization', async () => {
            let hasPermissions = await Promise.all([
                Permission.hasPermissionForOrganization(user._id, [PermissionType.EDIT_USER_PERMISSIONS], organization2._id, true),
                Permission.hasPermissionForOrganization(user._id, [PermissionType.EDIT_USER_PERMISSIONS], organization2._id),
                Permission.hasPermissionForOrganization(user._id, [PermissionType.APPROVE_SOLDIER], organization1._id, true),
                Permission.hasPermissionForOrganization(user._id, [PermissionType.APPROVE_SOLDIER], organization1._id),
            ])
            hasPermissions.forEach(hasPermission => {
                expect(hasPermission).to.be.false;
            });
        });

        it('Should return true when user has required permissions', async () => {
            let hasPermissions = await Promise.all([
                Permission.hasPermissionForOrganization(user._id, [PermissionType.EDIT_USER_PERMISSIONS], organization1._id),
                Permission.hasPermissionForOrganization(user._id, [PermissionType.EDIT_USER_PERMISSIONS, PermissionType.EDIT_WORKFLOW], organization1._id, true),
                Permission.hasPermissionForOrganization(user._id, [PermissionType.APPROVE_SOLDIER], organization2._id, true),
                Permission.hasPermissionForOrganization(user._id, [PermissionType.APPROVE_SOLDIER, PermissionType.EDIT_USER_PERMISSIONS], organization1._id, true),
                Permission.hasPermissionForOrganization(user._id, [PermissionType.APPROVE_SOLDIER, PermissionType.EDIT_USER_PERMISSIONS], organization2._id, true),
            ]);
            hasPermissions.forEach(hasPermission => {
                expect(hasPermission).to.be.true;
            });
        });

        it('Should return true when user is admin no metter what permission required', async () => {
            user.isAdmin = true;
            let _user = <IUser>await User.updateUser(user)
            expect(_user).to.exist;
            expect(_user).to.have.property('isAdmin', true);

            let hasPermissions = await Promise.all([
                Permission.hasPermissionForOrganization(_user._id, [PermissionType.APPROVE_CAR], organization2._id),
                Permission.hasPermissionForOrganization(_user._id, [PermissionType.APPROVE_CIVILIAN], organization2._id),
                Permission.hasPermissionForOrganization(_user._id, [PermissionType.EDIT_USER_PERMISSIONS], organization2._id),
                Permission.hasPermissionForOrganization(_user._id, [PermissionType.EDIT_WORKFLOW], organization2._id),
                Permission.hasPermissionForOrganization(_user._id, [PermissionType.DELETE_REQUEST], organization2._id),
                Permission.hasPermissionForOrganization(_user._id, [PermissionType.APPROVE_CAR], organization1._id),
                Permission.hasPermissionForOrganization(_user._id, [PermissionType.APPROVE_CIVILIAN], organization1._id),
                Permission.hasPermissionForOrganization(_user._id, [PermissionType.APPROVE_SOLDIER], organization1._id),
                Permission.hasPermissionForOrganization(_user._id, [PermissionType.EDIT_WORKFLOW], organization1._id),
                Permission.hasPermissionForOrganization(_user._id, [PermissionType.DELETE_REQUEST], organization1._id),
                Permission.hasPermissionForOrganization(_user._id, [PermissionType.EDIT_USER_PERMISSIONS, PermissionType.EDIT_WORKFLOW], organization1._id)
            ]);

            hasPermissions.forEach(hasPermission => {
                expect(hasPermission).to.be.true;
            });
        });
    });
});