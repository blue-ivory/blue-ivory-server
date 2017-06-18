import * as Promise from 'bluebird';
import { User } from './../user/user.class';
import { IUser } from './../user/user.interface';
import { IOrganization } from './../organization/organization.interface';
import { Organization } from './../organization/organization.class';
import { expect } from 'chai';
import { Permission } from './permission.class';
import { PermissionType } from "./permission.enum";
describe('Permission', () => {
    describe('#hasPermissions', () => {

        let user = <IUser>null;

        beforeEach(done => {
            let organization1 = null;
            let organization2 = null;

            Organization.createOrganization('org1').then((org: IOrganization) => {
                expect(org).to.exist;
                organization1 = org;

                return Organization.createOrganization('org2');
            }).then((org: IOrganization) => {
                expect(org).to.exist;
                organization2 = org;

                return User.createUser('Ron', 'Borysovski', '123456', 'roni537@gmail.com');
            }).then((u: IUser) => {
                expect(u).to.exist;
                user = u;

                return Promise.all([
                    User.setPermissions(user._id, organization1._id, [PermissionType.EDIT_USER_PERMISSIONS]),
                    User.setPermissions(user._id, organization2._id, [PermissionType.APPROVE_SOLDIER])
                ]);
            }).then(() => {
                done();
            });

        });

        it('Should return false when user not exists', done => {
            Permission.hasPermissions('notExistingUser', [PermissionType.EDIT_WORKFLOW]).then(hasPermissions => {
                expect(hasPermissions).to.be.false;

                done();
            });
        });

        it('Should return true when no permissions required', done => {
            Promise.all([
                Permission.hasPermissions(user._id, []),
                Permission.hasPermissions(user._id, [], true)
            ]).then((values: boolean[]) => {
                expect(values).to.exist
                    .and.be.an('array')
                    .and.have.length(2).and.to.satisfy((values: boolean[]) => {
                        values.forEach(v => expect(v).to.be.true);

                        return true;
                    });

                done();
            });
        });

        it('Should return false if user don\'t have required permissions', done => {
            Promise.all([
                Permission.hasPermissions(user._id, [PermissionType.APPROVE_CAR]),
                Permission.hasPermissions(user._id, [PermissionType.APPROVE_CAR, PermissionType.EDIT_WORKFLOW]),
                Permission.hasPermissions(user._id, [PermissionType.APPROVE_CIVILIAN, PermissionType.EDIT_USER_PERMISSIONS]),
                Permission.hasPermissions(user._id, [PermissionType.APPROVE_CIVILIAN, PermissionType.EDIT_WORKFLOW], true)
            ]).then((values: boolean[]) => {
                expect(values).to.exist
                    .and.to.be.an('array')
                    .and.to.have.length(4)
                    .and.to.satisfy((values: boolean[]) => {
                        values.forEach(value => expect(value).to.be.false);

                        return true;
                    });

                done();
            });
        });

        it('Should return true when user has the required permissions', done => {
            Promise.all([
                Permission.hasPermissions(user._id, [PermissionType.EDIT_USER_PERMISSIONS]),
                Permission.hasPermissions(user._id, [PermissionType.APPROVE_SOLDIER]),
                Permission.hasPermissions(user._id, [PermissionType.APPROVE_SOLDIER], true),
                Permission.hasPermissions(user._id, [PermissionType.EDIT_USER_PERMISSIONS, PermissionType.APPROVE_SOLDIER]),
                Permission.hasPermissions(user._id, [PermissionType.EDIT_USER_PERMISSIONS, PermissionType.APPROVE_SOLDIER], true),
                Permission.hasPermissions(user._id, [PermissionType.APPROVE_SOLDIER, PermissionType.APPROVE_CIVILIAN], true),
            ]).then((values: boolean[]) => {
                expect(values).to.exist
                    .and.to.be.an('array')
                    .and.to.have.length(6)
                    .and.to.satisfy((values: boolean[]) => {
                        values.forEach(value => expect(value).to.be.true);

                        return true;
                    });

                done();
            });
        });

        it('Should return false when user don\'t have enough permissions', done => {
            Promise.all([
                Permission.hasPermissions(user._id, [PermissionType.APPROVE_CAR]),
                Permission.hasPermissions(user._id, [PermissionType.APPROVE_SOLDIER, PermissionType.APPROVE_CAR]),
                Permission.hasPermissions(user._id, [PermissionType.APPROVE_CAR, PermissionType.APPROVE_CIVILIAN, PermissionType.EDIT_WORKFLOW], true),
                Permission.hasPermissions(user._id, [PermissionType.APPROVE_CAR, PermissionType.EDIT_USER_PERMISSIONS, PermissionType.EDIT_WORKFLOW])
            ]).then((values: boolean[]) => {
                expect(values).to.exist
                    .and.to.be.an('array')
                    .and.to.have.length(4)
                    .and.to.satisfy((values: boolean[]) => {
                        values.forEach(value => expect(value).to.be.false);

                        return true;
                    });

                done();
            });
        });

        it('Should return true when user is admin no metter what permissions required', done => {
            user.isAdmin = true;
            User.updateUser(user).then((user: IUser) => {
                expect(user).to.exist;
                expect(user).to.have.property('isAdmin', true);

                Promise.all([
                    Permission.hasPermissions(user._id, [PermissionType.APPROVE_CAR]),
                    Permission.hasPermissions(user._id, [PermissionType.APPROVE_CIVILIAN]),
                    Permission.hasPermissions(user._id, [PermissionType.APPROVE_SOLDIER]),
                    Permission.hasPermissions(user._id, [PermissionType.EDIT_USER_PERMISSIONS]),
                    Permission.hasPermissions(user._id, [PermissionType.EDIT_WORKFLOW]),
                    Permission.hasPermissions(user._id, [PermissionType.DELETE_REQUEST]),
                    Permission.hasPermissions(user._id, [
                        PermissionType.APPROVE_CAR,
                        PermissionType.APPROVE_CIVILIAN,
                        PermissionType.APPROVE_SOLDIER,
                        PermissionType.EDIT_USER_PERMISSIONS,
                        PermissionType.EDIT_WORKFLOW,
                        PermissionType.DELETE_REQUEST
                    ])
                ]).then((values: boolean[]) => {
                    expect(values).to.exist
                        .and.to.be.an('array')
                        .and.to.have.length(7)
                        .and.to.satisfy((values: boolean[]) => {
                            values.forEach(value => expect(value).to.be.true);

                            return true;
                        });

                    done();
                });
            });
        });
    });

    describe('#hasPermissionsForOrganization', () => {

        let user = <IUser>null;
        let organization1 = <IOrganization>null;
        let organization2 = <IOrganization>null;

        beforeEach(done => {
            Organization.createOrganization('org1').then((organization: IOrganization) => {
                expect(organization).to.exist;
                organization1 = organization;

                return Organization.createOrganization('org2');
            }).then((organization: IOrganization) => {
                expect(organization).to.exist;
                organization2 = organization;

                return User.createUser('Ron', 'Borysovski', '123456', 'roni537@gmail.com');
            }).then((usr: IUser) => {
                return User.setPermissions(usr._id, organization1._id, [PermissionType.EDIT_USER_PERMISSIONS]);
            }).then((usr: IUser) => {
                return User.setPermissions(usr._id, organization2._id, [PermissionType.APPROVE_SOLDIER]);
            }).then((usr: IUser) => {
                expect(usr).to.exist;
                user = usr;

                done();
            });
        });

        it('Should return false when user not found', done => {
            Promise.all([
                Permission.hasPermissionForOrganization('NotExistingUser', [], null),
                Permission.hasPermissionForOrganization('NotExistingUser', [], null, true),
                Permission.hasPermissionForOrganization('NotExistingUser', [PermissionType.APPROVE_SOLDIER], null),
                Permission.hasPermissionForOrganization('NotExistingUser', [PermissionType.APPROVE_SOLDIER], null, true),
            ]).then((values: boolean[]) => {
                expect(values).to.exist;
                expect(values).to.be.an('array')
                    .and.to.satisfy((values: boolean[]) => {
                        values.forEach(value => expect(value).to.be.false);

                        return true;
                    });

                done();
            });
        });

        it('Should return true when no permissions required', done => {
            Promise.all([
                Permission.hasPermissionForOrganization(user._id, [], organization1._id),
                Permission.hasPermissionForOrganization(user._id, [], organization1._id, true),
                Permission.hasPermissionForOrganization(user._id, [], organization2._id),
                Permission.hasPermissionForOrganization(user._id, [], organization2._id, true),
            ]).then((values: boolean[]) => {
                expect(values).to.exist;
                expect(values).to.be.an('array')
                    .and.to.satisfy((values: boolean[]) => {
                        values.forEach(value => expect(value).to.be.true);

                        return true;
                    });

                done();
            })
        });

        it('Should return false when user don\'t have required permissions', done => {
            Promise.all([
                Permission.hasPermissionForOrganization(user._id, [PermissionType.APPROVE_SOLDIER], organization1._id),
                Permission.hasPermissionForOrganization(user._id, [PermissionType.EDIT_USER_PERMISSIONS], organization2._id, true),
                Permission.hasPermissionForOrganization(user._id, [PermissionType.EDIT_WORKFLOW, PermissionType.APPROVE_CIVILIAN], organization2._id, true),
                Permission.hasPermissionForOrganization(user._id, [PermissionType.EDIT_USER_PERMISSIONS, PermissionType.APPROVE_CAR], organization1._id),
                Permission.hasPermissionForOrganization(user._id, [PermissionType.EDIT_USER_PERMISSIONS, PermissionType.APPROVE_SOLDIER], organization2._id)
            ]).then(hasPermissions => {
                hasPermissions.forEach(hasPermission => {
                    expect(hasPermission).to.be.false;
                });

                done();
            });
        });

        it('Should return false when user has required permissions but not for the required organization', done => {
            Promise.all([
                Permission.hasPermissionForOrganization(user._id, [PermissionType.EDIT_USER_PERMISSIONS], organization2._id, true),
                Permission.hasPermissionForOrganization(user._id, [PermissionType.EDIT_USER_PERMISSIONS], organization2._id),
                Permission.hasPermissionForOrganization(user._id, [PermissionType.APPROVE_SOLDIER], organization1._id, true),
                Permission.hasPermissionForOrganization(user._id, [PermissionType.APPROVE_SOLDIER], organization1._id),
            ]).then(hasPermissions => {
                hasPermissions.forEach(hasPermission => {
                    expect(hasPermission).to.be.false;
                });

                done();
            });
        });

        it('Should return true when user has required permissions', done => {
            Promise.all([
                Permission.hasPermissionForOrganization(user._id, [PermissionType.EDIT_USER_PERMISSIONS], organization1._id),
                Permission.hasPermissionForOrganization(user._id, [PermissionType.EDIT_USER_PERMISSIONS, PermissionType.EDIT_WORKFLOW], organization1._id, true),
                Permission.hasPermissionForOrganization(user._id, [PermissionType.APPROVE_SOLDIER], organization2._id, true),
                Permission.hasPermissionForOrganization(user._id, [PermissionType.APPROVE_SOLDIER, PermissionType.EDIT_USER_PERMISSIONS], organization1._id, true),
                Permission.hasPermissionForOrganization(user._id, [PermissionType.APPROVE_SOLDIER, PermissionType.EDIT_USER_PERMISSIONS], organization2._id, true),
            ]).then(hasPermissions => {
                hasPermissions.forEach(hasPermission => {
                    expect(hasPermission).to.be.true;
                });

                done();
            });
        });

        it('Should return true when user is admin no metter what permission required', done => {
            user.isAdmin = true;
            User.updateUser(user).then((user: IUser) => {
                expect(user).to.exist;
                expect(user).to.have.property('isAdmin', true);

                return Promise.all([
                    Permission.hasPermissionForOrganization(user._id, [PermissionType.APPROVE_CAR], organization2._id),
                    Permission.hasPermissionForOrganization(user._id, [PermissionType.APPROVE_CIVILIAN], organization2._id),
                    Permission.hasPermissionForOrganization(user._id, [PermissionType.EDIT_USER_PERMISSIONS], organization2._id),
                    Permission.hasPermissionForOrganization(user._id, [PermissionType.EDIT_WORKFLOW], organization2._id),
                    Permission.hasPermissionForOrganization(user._id, [PermissionType.DELETE_REQUEST], organization2._id),
                    Permission.hasPermissionForOrganization(user._id, [PermissionType.APPROVE_CAR], organization1._id),
                    Permission.hasPermissionForOrganization(user._id, [PermissionType.APPROVE_CIVILIAN], organization1._id),
                    Permission.hasPermissionForOrganization(user._id, [PermissionType.APPROVE_SOLDIER], organization1._id),
                    Permission.hasPermissionForOrganization(user._id, [PermissionType.EDIT_WORKFLOW], organization1._id),
                    Permission.hasPermissionForOrganization(user._id, [PermissionType.DELETE_REQUEST], organization1._id),
                    Permission.hasPermissionForOrganization(user._id, [PermissionType.EDIT_USER_PERMISSIONS, PermissionType.EDIT_WORKFLOW], organization1._id)
                ]);
            }).then(hasPermissions => {
                hasPermissions.forEach(hasPermission => {
                    expect(hasPermission).to.be.true;
                });

                done();
            });
        });
    });
});