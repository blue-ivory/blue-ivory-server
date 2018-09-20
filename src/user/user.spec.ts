import { expect } from 'chai';
import * as mongoose from 'mongoose';
import { IOrganization } from "../organization/organization.interface";
import { PermissionType } from "../permission/permission.enum";
import { Organization } from "./../organization/organization.class";
import { User } from "./user.class";
import { IUser } from "./user.interface";

describe('User', () => {

    describe('#createUser', () => {
        it('Should create a user', async () => {
            let user = await User.createUser('Ron', 'Borysovski', '123456', 'roni537@gmail.com');

            expect(user).to.exist;
            expect(user).to.have.property('firstName', 'Ron');
            expect(user).to.have.property('lastName', 'Borysovski');
            expect(user).to.have.property('_id', '123456');
            expect(user).to.have.property('mail', 'roni537@gmail.com');
        });
        it('Should throw an error when not user is not valid', async () => {
            try {
                await User.createUser('Ron', null, null, null);
            } catch (err) {
                expect(err).to.exist;
            }
        });
        it('Should throw an error when same ID or mail is given', async () => {
            try {
                await User.createUser('Ron', 'Borysovski', '123456', 'roni537@gmail.com');
                await User.createUser('John', 'Doe', '123456', 'mail@gmail.com');
            } catch (err) {
                expect(err).to.exist;
                expect(err).to.have.property('code', 11000);
            }
        });
    });

    describe('#findUser', () => {
        it('Should return null when user not found', async () => {
            let user = await User.findUser('id');
            expect(user).to.not.exist;
        });

        it('Should return user if exists', async () => {
            await User.createUser('Ron', 'Borysovski', '123456', 'roni537@gmail.com');
            let user = await User.findUser('123456');

            expect(user).to.exist;
            expect(user).to.have.property('firstName', 'Ron');
        });
    });

    describe('#updateUser', () => {
        it('Should return null when user not exists', async () => {
            let user = <IUser>{
                firstName: 'Ron',
                lastName: 'Borysovski',
                _id: '123456',
                mail: 'roni537@gmail.com'
            };

            let updatedUser = await User.updateUser(user);
            expect(updatedUser).to.not.exist;
        });

        it('Should update a user', async () => {
            let user = <IUser>await User.createUser('Ron', 'Borysovski', '123456', 'roni537@gmail.com');
            expect(user).to.exist;
            expect(user).to.have.property('isAdmin', false);

            user.firstName = 'Admin';
            user.lastName = 'Administrator';
            user.isAdmin = true;

            let updatedUser = await User.updateUser(user);
            expect(updatedUser).to.exist;
            expect(updatedUser).to.have.property('isAdmin', true);
            expect(updatedUser).to.have.property('firstName', 'Admin');
            expect(updatedUser).to.have.property('lastName', 'Administrator');
        });

        it('Should throw an error when _id not exists', async () => {
            let user = <IUser>{
                firstName: 'Ron'
            };

            try {
                await User.updateUser(user);
            } catch (err) {
                expect(err).to.exist;
                expect(err).to.have.property('name', 'CastError');
                expect(err).to.have.property('path', '_id');
            }
        });
    });

    describe('#searchUsers', () => {
        beforeEach(async () => {
            await User.createUser('Ron', 'Borysovski', '123456', 'roni537@gmail.com');
            await User.createUser('John', 'Doe', '789000', 'address@yahoo.com');
        });

        it('Should return 0 users when not found', async () => {
            let collection = await User.searchUsers('test');
            expect(collection).to.exist;
            expect(collection).to.have.property('totalCount', 0);
            expect(collection).to.have.property('set')
                .which.is.an('array').with.length(0);
        });

        it('Should return all users when searchTerm is empty', async () => {
            let collection = await User.searchUsers();

            expect(collection).to.exist;
            expect(collection).to.have.property('totalCount', 2);
            expect(collection).to.have.property('set')
                .which.is.an('array').with.length(2);
        });

        it('Should find users by firstName, lastName or unique id (single word)', async () => {
            let collection = await User.searchUsers('ron');
            expect(collection).to.exist;
            expect(collection).to.have.property('totalCount', 1);

            collection = await User.searchUsers('ohn');
            expect(collection).to.exist;
            expect(collection).to.have.property('totalCount', 1);

            collection = await User.searchUsers('rySovS');
            expect(collection).to.exist;
            expect(collection).to.have.property('totalCount', 1);

            collection = await User.searchUsers('OE');
            expect(collection).to.exist;
            expect(collection).to.have.property('totalCount', 1);

            collection = await User.searchUsers('o');
            expect(collection).to.exist;
            expect(collection).to.have.property('totalCount', 2);

            collection = await User.searchUsers('45');
            expect(collection).to.exist;
            expect(collection).to.have.property('totalCount', 1);
        });

        it('Should find users either by firstName or by lastName (two words)', async () => {
            let collection = await User.searchUsers('ron ory');
            expect(collection).to.exist;
            expect(collection).to.have.property('totalCount', 1);

            collection = await User.searchUsers('ohn e');
            expect(collection).to.exist;
            expect(collection).to.have.property('totalCount', 1);

            collection = await User.searchUsers('borysovski ON');
            expect(collection).to.exist;
            expect(collection).to.have.property('totalCount', 1);

            collection = await User.searchUsers('Sovski ON');
            expect(collection).to.exist;
            expect(collection).to.have.property('totalCount', 1);

            collection = await User.searchUsers('oe Jo');
            expect(collection).to.exist;
            expect(collection).to.have.property('totalCount', 1);

            collection = await User.searchUsers('o o')
            expect(collection).to.exist;
            expect(collection).to.have.property('totalCount', 2);
        });
    });

    describe('#setOrganization', () => {

        let organization: IOrganization;
        let user: IUser;

        beforeEach(async () => {
            organization = <IOrganization>await Organization.createOrganization('organization');
            user = <IUser>await User.createUser('Ron', 'Borysovski', '123456', 'roni537@gmail.com');
        });

        it('Should do nothing when user not exists', async () => {
            let _user = await User.setOrganization('unique@id', null)
            expect(_user).to.not.exist;
        });

        it('Should remove user\'s organization if organization not exists', async () => {
            let _user = await User.setOrganization(user._id, null)
            expect(_user).to.exist;
            expect(_user).to.have.property('organization', null);
        });

        it('Should set user\'s organization', async () => {
            let _user = await User.setOrganization(user._id, organization._id);
            expect(_user).to.exist;
            expect(_user).to.have.property('organization')
                .which.has.property('name', 'organization');
        })
    });

    describe('#setPermissions', () => {

        let user: IUser = null;
        let organization1: IOrganization = null;
        let organization2: IOrganization = null;

        beforeEach(async () => {
            user = <IUser>await User.createUser('Ron', 'Borysovski', '123456', 'roni537@gmail.com');
            organization1 = <IOrganization>await Organization.createOrganization('org1');
            organization2 = <IOrganization>await Organization.createOrganization('org2');
        });

        it('Should throw an error when user and organization not exists', async () => {
            try {
                await User.setPermissions(null, null, []);
            } catch (err) {
                expect(err).to.exist;
                expect(err).to.have.property('message', 'User or organization not found');
            }
        });

        it('Should throw an error when user not exists', async () => {
            try {
                await User.setPermissions(null, organization1._id, []);
            } catch (err) {
                expect(err).to.exist;
                expect(err).to.have.property('message', 'User or organization not found');
            }
        });

        it('Should throw an error when organization not exists', async () => {
            try {
                await User.setPermissions(user._id, null, []);
            } catch (err) {
                expect(err).to.exist;
                expect(err).to.have.property('message', 'User or organization not found');
            }
        });

        it('Should set permissions', async () => {
            let _user = <IUser>await User.setPermissions(user._id, organization1._id,
                [PermissionType.EDIT_WORKFLOW, PermissionType.APPROVE_CIVILIAN]);

            expect(_user).to.exist;
            _user = <IUser>await User.setPermissions(_user._id, organization2._id,
                [PermissionType.EDIT_USER_PERMISSIONS, PermissionType.DELETE_REQUEST]);

            expect(_user).to.exist;
            expect(_user).to.have.property('permissions').that.satisfies(permissions => {
                expect(permissions).to.exist;
                expect(permissions).to.be.an('array');

                expect(permissions[0]).to.have
                    .property('organization').that
                    .satisfies(org => organization1._id.equals(org._id));
                expect(permissions[0]).to.have
                    .property('organizationPermissions').that.include
                    .members([PermissionType.EDIT_WORKFLOW, PermissionType.APPROVE_CIVILIAN]);

                expect(permissions[1]).to.have
                    .property('organization').that
                    .satisfies(org => organization2._id.equals(org._id));
                expect(permissions[1]).to.have
                    .property('organizationPermissions').that.include
                    .members([PermissionType.EDIT_USER_PERMISSIONS, PermissionType.DELETE_REQUEST]);

                return true;
            });
        });


        it('Should update permissions for organization and not create multiple instances', async () => {

            let _user = <IUser>await User.setPermissions(user._id, organization1._id, [PermissionType.APPROVE_CAR]);

            expect(_user).to.exist;

            _user = <IUser>await User.setPermissions(_user._id, organization2._id, [PermissionType.EDIT_WORKFLOW]);
            expect(_user).to.exist;

            _user = <IUser>await User.setPermissions(user._id, organization2._id, [PermissionType.APPROVE_SOLDIER]);
            expect(_user).to.exist;
            expect(_user).to.have.property('permissions').that.satisfies(permissions => {
                expect(permissions).to.exist;
                expect(permissions).to.be.an('array');

                expect(permissions[0]).to.have
                    .property('organization').that
                    .satisfies(org => organization1._id.equals(org._id));
                expect(permissions[0]).to.have
                    .property('organizationPermissions').that.include
                    .members([PermissionType.APPROVE_CAR]);

                expect(permissions[1]).to.have
                    .property('organization').that
                    .satisfies(org => organization2._id.equals(org._id));
                expect(permissions[1]).to.have
                    .property('organizationPermissions').that.include
                    .members([PermissionType.APPROVE_SOLDIER]);

                return true;
            });
        });

        it('Should remove organization\'s permissions when no permissions are provided', async () => {
            let _user = <IUser>await User.setPermissions(user._id, organization1._id, [])
            expect(_user).to.exist;
            expect(_user).to.have.deep.property('permissions')
                .which.is.an('array')
                .and.has.length(0);

            _user = <IUser>await User.setPermissions(_user._id, organization1._id, [PermissionType.EDIT_WORKFLOW]);
            expect(_user).to.exist;

            _user = <IUser>await User.setPermissions(user._id, organization1._id, []);
            expect(_user).to.exist;
            expect(_user).to.have.deep.property('permissions')
                .which.is.an('array')
                .and.has.length(0);
        });

        it('Should not set duplicate permissions', async () => {
            let _user = <IUser>await User.setPermissions(user._id, organization1._id,
                [PermissionType.APPROVE_CAR, PermissionType.APPROVE_CAR]);
            expect(_user).to.exist;
            expect(_user).to.have.property('permissions')
                .which.is.an('array')
                .and.has.length(1).that.satisfies(permissions => {
                    expect(permissions).to.exist;
                    expect(permissions[0]).to.exist;
                    expect(permissions[0]).to.have.property('organizationPermissions')
                        .which.is.an('array')
                        .and.has.length(1);

                    return true;
                });

        });
    });

    describe('#getApprovableUsersByOrganization', () => {

        let user1: IUser = null;
        let user2: IUser = null;
        let organization1: IOrganization = null;
        let organization2: IOrganization = null;

        beforeEach(async () => {
            user1 = <IUser>await User.createUser('tester', 'user', '123456', 'mail')
            user2 = <IUser>await User.createUser('tester2', 'user2', '1111111', 'mail2');
            organization1 = <IOrganization>await Organization.createOrganization('org1');
            organization2 = <IOrganization>await Organization.createOrganization('org2');
            await User.setPermissions(user1._id, organization1._id, [PermissionType.EDIT_USER_PERMISSIONS]);
            await User.setPermissions(user2._id, organization2._id, [PermissionType.APPROVE_SOLDIER]);
            await User.setPermissions(user1._id, organization2._id, [PermissionType.APPROVE_CAR]);
        });


        it('Should return empty array when no organization exists', async () => {
            let users = await User.getApprovableUsersByOrganization(new mongoose.Types.ObjectId(), false, false);
            expect(users).to.exist
                .and.to.be.an('array')
                .with.length(0);
        });

        it('Should return empty array when no user has required permissions', async () => {
            let users = await User.getApprovableUsersByOrganization(organization1._id, true, false);
            expect(users).to.exist
                .and.to.be.an('array')
                .with.length(0);
        });

        it('Should return array with users with the right permissions for organization', async () => {
            let users = await User.getApprovableUsersByOrganization(organization2._id, true, true)
            expect(users).to.exist
                .and.to.be.an('array')
                .with.length(2);

            users = await User.getApprovableUsersByOrganization(organization2._id, false, true);
            expect(users).to.exist
                .and.to.be.an('array')
                .with.length(1);
        });

        it('Should return empty array when user has permissions but for different organization', async () => {
            let users = await User.getApprovableUsersByOrganization(organization1._id, false, true);
            expect(users).to.exist
                .and.to.be.an('array')
                .with.length(0);
        });
    });
});