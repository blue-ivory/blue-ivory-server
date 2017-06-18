import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import { expect } from 'chai';
import { ICollection } from '../helpers/collection';
import { IUser } from "./user.interface";
import { Organization } from "./../organization/organization.class";
import { User } from "./user.class";
import { IOrganization } from "../organization/organization.interface";
import { PermissionType } from "../permission/permission.enum";

describe('User', () => {

    describe('#createUser', () => {
        it('Should create a user', done => {
            User.createUser('Ron', 'Borysovski', '123456', 'roni537@gmail.com').then((user: IUser) => {
                expect(user).to.exist;
                expect(user).to.have.property('firstName', 'Ron');
                expect(user).to.have.property('lastName', 'Borysovski');
                expect(user).to.have.property('_id', '123456');
                expect(user).to.have.property('mail', 'roni537@gmail.com');

                done();
            }).catch(err => {
                console.log(err);
                expect(err).to.not.exist;
            });
        });
        it('Should throw an error when not user is not valid', done => {
            User.createUser('Ron', null, null, null).catch(err => {
                expect(err).to.exist;

                done();
            });
        });
        it('Should throw an error when same ID or mail is given', done => {
            Promise.all([
                User.createUser('Ron', 'Borysovski', '123456', 'roni537@gmail.com'),
                User.createUser('John', 'Doe', '123456', 'mail@gmail.com')]).catch(error => {
                    expect(error).to.exist;
                    expect(error).to.have.property('code', 11000);

                    done();
                });
        });
    });

    describe('#findUser', () => {
        it('Should return null when user not found', done => {
            User.findUser('id').then((user: IUser) => {
                expect(user).to.not.exist;

                done();
            })
        });

        it('Should return user if exists', done => {
            User.createUser('Ron', 'Borysovski', '123456', 'roni537@gmail.com').then(() => {
                return User.findUser('123456');
            }).then((user: IUser) => {
                expect(user).to.exist;
                expect(user).to.have.property('firstName', 'Ron');

                done();
            });
        });
    });

    describe('#updateUser', () => {
        it('Should return null when user not exists', done => {
            let user = <IUser>{
                firstName: 'Ron',
                lastName: 'Borysovski',
                _id: '123456',
                mail: 'roni537@gmail.com'
            };

            User.updateUser(user).then((user: IUser) => {
                expect(user).to.not.exist;

                done();
            });
        });

        it('Should update a user', done => {
            User.createUser('Ron', 'Borysovski', '123456', 'roni537@gmail.com').then((user: IUser) => {
                expect(user).to.exist;
                expect(user).to.have.property('isAdmin', false);

                user.firstName = 'Admin';
                user.lastName = 'Administrator';
                user.isAdmin = true;

                return User.updateUser(user);
            }).then((user: IUser) => {
                expect(user).to.exist;
                expect(user).to.have.property('isAdmin', true);
                expect(user).to.have.property('firstName', 'Admin');
                expect(user).to.have.property('lastName', 'Administrator');

                done();
            });
        });

        it('Should throw an error when _id not exists', done => {
            let user = <IUser>{
                firstName: 'Ron'
            };

            User.updateUser(user).catch(err => {
                expect(err).to.exist;
                expect(err).to.have.property('name', 'CastError');
                expect(err).to.have.property('path', '_id');

                done();
            })
        });
    });

    describe('#searchUsers', () => {
        beforeEach(done => {
            Promise.all([
                User.createUser('Ron', 'Borysovski', '123456', 'roni537@gmail.com'),
                User.createUser('John', 'Doe', '789000', 'address@yahoo.com')
            ]).then(() => {
                done();
            });
        });

        it('Should return 0 users when not found', done => {
            User.searchUsers('test').then((collection: ICollection<IUser>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 0);
                expect(collection).to.have.property('set').that.satisfies((set: IUser[]) => {
                    expect(set).to.exist;
                    expect(set).to.be.an('array');
                    expect(set).to.have.length(0);

                    return true;
                });

                done();
            })
        });

        it('Should return all users when searchTerm is empty', done => {
            User.searchUsers().then((collection: ICollection<IUser>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 2);
                expect(collection).to.have.property('set').that.satisfies((set: IUser[]) => {
                    expect(set).to.exist;
                    expect(set).to.be.an('array');
                    expect(set).to.have.length(2);

                    return true;
                });

                done();
            });
        });

        it('Should find users by firstName, lastName or unique id (single word)', done => {
            User.searchUsers('ron').then((collection: ICollection<IUser>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 1);

                return User.searchUsers('ohn');
            }).then((collection: ICollection<IUser>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 1);

                return User.searchUsers('rySovS');
            }).then((collection: ICollection<IUser>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 1);

                return User.searchUsers('OE');
            }).then((collection: ICollection<IUser>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 1);

                return User.searchUsers('o');
            }).then((collection: ICollection<IUser>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 2);

                return User.searchUsers('45');
            }).then((collection: ICollection<IUser>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 1);

                done();
            });
        });

        it('Should find users either by firstName or by lastName (two words)', done => {
            User.searchUsers('ron ory').then((collection: ICollection<IUser>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 1);

                return User.searchUsers('ohn e');
            }).then((collection: ICollection<IUser>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 1);

                return User.searchUsers('borysovski ON');
            }).then((collection: ICollection<IUser>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 1);

                return User.searchUsers('Sovski ON');
            }).then((collection: ICollection<IUser>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 1);

                return User.searchUsers('oe Jo');
            }).then((collection: ICollection<IUser>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 1);

                return User.searchUsers('o o')
            }).then((collection: ICollection<IUser>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 2);

                done();
            });
        });
    });

    describe('#setOrganization', () => {

        let organization: IOrganization;
        let user: IUser;

        beforeEach(done => {
            Organization.createOrganization('organization').then((org: IOrganization) => {
                expect(org).to.exist;
                organization = org;

                return User.createUser('Ron', 'Borysovski', '123456', 'roni537@gmail.com');
            }).then((u: IUser) => {
                expect(u).to.exist;
                user = u;

                done();
            });
        });

        it('Should do nothing when user not exists', done => {
            User.setOrganization('unique@id', null).then((user: IUser) => {
                expect(user).to.not.exist;

                done();
            });
        });

        it('Should remove user\'s organization if organization not exists', done => {
            User.setOrganization(user._id, null).then((user: IUser) => {
                expect(user).to.exist;
                expect(user).to.have.property('organization', null);
                done();
            });
        });

        it('Should set user\'s organization', done => {
            User.setOrganization(user._id, organization._id).then((user: IUser) => {
                expect(user).to.exist;
                expect(user).to.have.property('organization').that.satisfies((organization: IOrganization) => {
                    expect(organization).to.exist;
                    expect(organization).to.have.property('name', 'organization');

                    return true;
                });

                done();
            });
        })
    });

    describe('#setPermissions', () => {

        let user: IUser = null;
        let organization1: IOrganization = null;
        let organization2: IOrganization = null;

        beforeEach(done => {
            User.createUser('Ron', 'Borysovski', '123456', 'roni537@gmail.com').then((u: IUser) => {
                expect(u).to.exist;
                user = u;

                return Organization.createOrganization('org1');
            }).then((org1: IOrganization) => {
                expect(org1).to.exist;
                organization1 = org1;

                return Organization.createOrganization('org2');
            }).then((org2: IOrganization) => {
                expect(org2).to.exist;
                organization2 = org2;

                done();
            })
        });

        it('Should throw an error when user and organization not exists', done => {
            User.setPermissions(null, null, []).catch(err => {
                expect(err).to.exist;
                expect(err).to.eql('User or organization not found');

                done();
            })
        });

        it('Should throw an error when user not exists', done => {
            User.setPermissions(null, organization1._id, []).catch(err => {
                expect(err).to.exist;
                expect(err).to.eql('User or organization not found');

                done();
            })
        });

        it('Should throw an error when organization not exists', done => {
            User.setPermissions(user._id, null, []).catch(err => {
                expect(err).to.exist;
                expect(err).to.eql('User or organization not found');

                done();
            })
        });

        it('Should set permissions', done => {
            User.setPermissions(user._id, organization1._id,
                [PermissionType.EDIT_WORKFLOW, PermissionType.APPROVE_CIVILIAN])
                .then((user: IUser) => {
                    expect(user).to.exist;
                    return User.setPermissions(user._id, organization2._id,
                        [PermissionType.EDIT_USER_PERMISSIONS, PermissionType.DELETE_REQUEST]);
                }).then((user: IUser) => {
                    expect(user).to.exist;
                    expect(user).to.have.property('permissions').that.satisfies(permissions => {
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

                    done();
                });
        });

        it('Should update permissions for organization and not create multiple instances', done => {
            User.setPermissions(user._id, organization1._id, [PermissionType.APPROVE_CAR])
                .then((user: IUser) => {
                    expect(user).to.exist;

                    return User.setPermissions(user._id, organization2._id, [PermissionType.EDIT_WORKFLOW]);
                }).then((user: IUser) => {
                    expect(user).to.exist;

                    return User.setPermissions(user._id, organization2._id, [PermissionType.APPROVE_SOLDIER]);
                }).then((user: IUser) => {
                    expect(user).to.exist;
                    expect(user).to.have.property('permissions').that.satisfies(permissions => {
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

                    done();
                });
        });

        it('Should remove organization\'s permissions when no permissions are provided', done => {
            User.setPermissions(user._id, organization1._id, []).then((user: IUser) => {
                expect(user).to.exist;
                expect(user).to.have.deep.property('permissions')
                    .which.is.an('array')
                    .and.has.length(0);

                return User.setPermissions(user._id, organization1._id, [PermissionType.EDIT_WORKFLOW]);
            }).then((user: IUser) => {
                expect(user).to.exist;

                return User.setPermissions(user._id, organization1._id, []);
            }).then((user: IUser) => {
                expect(user).to.exist;
                expect(user).to.have.deep.property('permissions')
                    .which.is.an('array')
                    .and.has.length(0);

                done();
            });
        });

        it('Should not set duplicate permissions', done => {
            User.setPermissions(user._id, organization1._id,
                [PermissionType.APPROVE_CAR, PermissionType.APPROVE_CAR]).then((user: IUser) => {
                    expect(user).to.exist;
                    expect(user).to.have.property('permissions')
                        .which.is.an('array')
                        .and.has.length(1).that.satisfies(permissions => {
                            expect(permissions).to.exist;
                            expect(permissions[0]).to.exist;
                            expect(permissions[0]).to.have.property('organizationPermissions')
                                .which.is.an('array')
                                .and.has.length(1);

                            return true;
                        });

                    done();
                });
        });
    });

    describe('#getApprovableUsersByOrganization', () => {

        let user1: IUser = null;
        let user2: IUser = null;
        let organization1: IOrganization = null;
        let organization2: IOrganization = null;

        beforeEach(done => {
            User.createUser('tester', 'user', '123456', 'mail').then((u: IUser) => {
                expect(u).to.exist;
                user1 = u;

                return User.createUser('tester2', 'user2', '1111111', 'mail2');
            }).then((u: IUser) => {
                expect(u).to.exist;
                user2 = u;

                return Organization.createOrganization('org1');
            }).then((org1: IOrganization) => {
                expect(org1).to.exist;
                organization1 = org1;

                return Organization.createOrganization('org2');
            }).then((org2: IOrganization) => {
                expect(org2).to.exist;
                organization2 = org2;

                return User.setPermissions(user1._id, organization1._id, [PermissionType.EDIT_USER_PERMISSIONS]);
            }).then(() => {
                return User.setPermissions(user2._id, organization2._id, [PermissionType.APPROVE_SOLDIER]);
            }).then(() => {
                return User.setPermissions(user1._id, organization2._id, [PermissionType.APPROVE_CAR]);
            }).then(() => {
                done();
            });
        });


        it('Should return empty array when no organization exists', done => {
            User.getApprovableUsersByOrganization(new mongoose.Types.ObjectId(), false, false).then(users => {
                expect(users).to.exist
                    .and.to.be.an('array')
                    .with.length(0);

                done();
            });
        });

        it('Should return empty array when no user has required permissions', done => {
            User.getApprovableUsersByOrganization(organization1._id, true, false).then(users => {
                expect(users).to.exist
                    .and.to.be.an('array')
                    .with.length(0);

                done();
            });
        });

        it('Should return array with users with the right permissions for organization', done => {
            User.getApprovableUsersByOrganization(organization2._id, true, true).then(users => {
                expect(users).to.exist
                    .and.to.be.an('array')
                    .with.length(2);

                return User.getApprovableUsersByOrganization(organization2._id, false, true);
            }).then(users => {
                expect(users).to.exist
                    .and.to.be.an('array')
                    .with.length(1);

                done();
            });
        });

        it('Should return empty array when user has permissions but for different organization', done => {
            User.getApprovableUsersByOrganization(organization1._id, false, true).then(users => {
                expect(users).to.exist
                    .and.to.be.an('array')
                    .with.length(0);

                done();
            });
        });
    });
});