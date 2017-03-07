/// <reference path="../../typings/index.d.ts" />
import { UserManager } from './../server/managers/user.manager';
import { PermissionManager } from './../server/managers/permission.manager';
import { OrganizationManager } from './../server/managers/organization.manager';
import { User } from './../server/classes/user';
import { Organization } from './../server/classes/organization';
import { Permission } from './../server/classes/permission';
import { expect } from 'chai';

describe('PermissionManager', () => {
    let permissionManager: PermissionManager = new PermissionManager();
    let userManager: UserManager = new UserManager();
    let organizationManager: OrganizationManager = new OrganizationManager();

    describe('#setPermissions', () => {
        it('Should do nothing when user not exists in DB', done => {
            organizationManager.create(new Organization('test')).then(organization => {
                expect(organization).to.exist;
                permissionManager.setPermissions('123', organization, [Permission.ADMIN]).catch(err => {
                    expect(err).to.exist;
                    expect(err).to.eql('User not found');
                    done();
                });
            });
        });

        it('Should set permissions', done => {
            organizationManager.create(new Organization('test1')).then((organization1: Organization) => {
                expect(organization1).to.exist;
                organizationManager.create(new Organization('test2')).then((organization2: Organization) => {
                    expect(organization2).to.exist;
                    userManager.create(new User('fName', 'lName', 'uid', 'mail')).then((user: User) => {
                        expect(user).to.exist;
                        userManager.setOrganization('uid', organization1._id).then((user: User) => {
                            expect(user).to.exist;
                            permissionManager.setPermissions('uid', organization1, [Permission.ADMIN, Permission.APPROVE_CIVILIAN]).then((user: User) => {
                                expect(user).to.exist;

                                permissionManager.setPermissions('uid', organization2, [Permission.EDIT_USER_PERMISSIONS, Permission.NORMAL_USER]).then((user: User) => {

                                    expect(user).to.exist;
                                    expect(user).to.have.property('permissions');
                                    expect(user.permissions).to.be.an('array');
                                    expect(user.permissions).to.have.length(2);
                                    expect(user.permissions[0]).to.have.property('organization');
                                    expect(user.permissions[0].organization).to.have.property('name', organization1.name);
                                    expect(user.permissions[0]).to.have.property('organizationPermissions');
                                    expect(user.permissions[0].organizationPermissions).to.have.length(2);
                                    expect(user.permissions[0].organizationPermissions).to.have.members([Permission.ADMIN, Permission.APPROVE_CIVILIAN]);
                                    expect(user.permissions[1]).to.have.property('organization');
                                    expect(user.permissions[1].organization).to.have.property('name', organization2.name);
                                    expect(user.permissions[1]).to.have.property('organizationPermissions');
                                    expect(user.permissions[1].organizationPermissions).to.have.length(2);
                                    expect(user.permissions[1].organizationPermissions).to.have.members([Permission.EDIT_USER_PERMISSIONS, Permission.NORMAL_USER]);

                                    done();

                                });
                            });
                        });
                    });
                });
            });
        });

        it('Should update permissions for organization and not create multiple instances', done => {
            organizationManager.create(new Organization('test1')).then((organization: Organization) => {
                expect(organization).to.exist;
                userManager.create(new User('fName', 'lName', 'uid', 'mail')).then((user: User) => {
                    expect(user).to.exist;
                    userManager.setOrganization('uid', organization._id).then((user: User) => {
                        expect(user).to.exist;
                        permissionManager.setPermissions('uid', organization, [Permission.ADMIN, Permission.APPROVE_SOLDIER]).then((user: User) => {
                            expect(user).to.exist;
                            permissionManager.setPermissions('uid', organization, [Permission.APPROVE_CAR]).then((user: User) => {
                                expect(user).to.exist;

                                organizationManager.create(new Organization('o')).then(organization2 => {
                                    permissionManager.setPermissions('uid', organization2, [Permission.ADMIN]).then(user => {
                                        expect(user).to.exist;

                                        expect(user).to.have.property('permissions');
                                        expect(user.permissions).to.be.an('array');
                                        expect(user.permissions).to.have.length(2);
                                        expect(user.permissions[0]).to.have.property('organization');
                                        expect(user.permissions[0].organization).to.have.property('name', organization.name);
                                        expect(user.permissions[0]).to.have.property('organizationPermissions');
                                        expect(user.permissions[0].organizationPermissions).to.have.length(1);
                                        expect(user.permissions[0].organizationPermissions).to.have.members([Permission.APPROVE_CAR]);
                                        expect(user.permissions[1]).to.have.property('organization');
                                        expect(user.permissions[1].organization).to.have.property('name', organization2.name);
                                        expect(user.permissions[1]).to.have.property('organizationPermissions');
                                        expect(user.permissions[1].organizationPermissions).to.have.length(1);
                                        expect(user.permissions[1].organizationPermissions).to.have.members([Permission.ADMIN]);

                                        done();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });

        it('Should do nothing when no permissions are given', done => {
            organizationManager.create(new Organization('test')).then(organization => {
                expect(organization).to.exist;

                userManager.create(new User('fName', 'lName', 'uid', 'mail')).then((user: User) => {
                    expect(user).to.exist;

                    userManager.setOrganization('uid', organization._id).then((user: User) => {
                        expect(user).to.exist;

                        permissionManager.setPermissions('uid', organization, []).then((user: User) => {
                            expect(user).to.exist;

                            expect(user).to.have.property('permissions');
                            expect(user.permissions).to.be.an('array');
                            expect(user.permissions).to.have.length(0);

                            done();
                        });
                    });
                });
            });
        });

        it('Should remove all permissions when no permissions passed', done => {
            organizationManager.create(new Organization('test1')).then((organization: Organization) => {
                expect(organization).to.exist;
                organizationManager.create(new Organization('test2')).then((organization2: Organization) => {
                    expect(organization2).to.exist;

                    userManager.create(new User('fName', 'lName', 'uid', 'mail')).then((user: User) => {
                        expect(user).to.exist;
                        userManager.setOrganization('uid', organization._id).then((user: User) => {
                            expect(user).to.exist;
                            permissionManager.setPermissions('uid', organization, [Permission.ADMIN, Permission.APPROVE_SOLDIER]).then((user: User) => {
                                expect(user).to.exist;
                                permissionManager.setPermissions('uid', organization2, [Permission.EDIT_USER_PERMISSIONS, Permission.NORMAL_USER]).then((user: User) => {
                                    expect(user).to.exist;
                                    permissionManager.setPermissions('uid', organization, []).then((user: User) => {
                                        expect(user).to.exist;
                                        expect(user).to.have.property('permissions');
                                        expect(user.permissions).to.be.an('array');
                                        expect(user.permissions).to.have.length(1);
                                        expect(user.permissions[0]).to.have.property('organization');
                                        expect(user.permissions[0].organization).to.have.property('name', organization2.name);
                                        expect(user.permissions[0]).to.have.property('organizationPermissions');
                                        expect(user.permissions[0].organizationPermissions).to.have.length(2);
                                        expect(user.permissions[0].organizationPermissions).to.have.members([Permission.EDIT_USER_PERMISSIONS, Permission.NORMAL_USER]);

                                        done();
                                    });
                                });
                            });
                        });
                    });
                });
            });
            it('Should not set duplicate permissions');
        });

    });

    describe('#hasPermission', () => {

        let user = null;

        beforeEach((done: MochaDone) => {
            let organization1 = null;
            let organization2 = null;

            organizationManager.create(new Organization('org1')).then((org: Organization) => {
                organization1 = org;
            }).then(() => {
                return organizationManager.create(new Organization('org2'));
            }).then((org: Organization) => {
                organization2 = org;
            }).then(() => {
                return userManager.create(new User('Ron', 'Borysovski', 'uid', 'mail'));
            }).then((usr: User) => {
                return permissionManager.setPermissions(usr._id, organization1, [Permission.EDIT_USER_PERMISSIONS]);
            }).then((usr: User) => {
                return permissionManager.setPermissions(usr._id, organization2, [Permission.APPROVE_SOLDIER]);
            }).then((usr: User) => {
                user = usr;
                done();
            });
        });

        it('Should notify when user not exists', (done: MochaDone) => {
            permissionManager.hasPermissions('test', []).catch(err => {
                expect(err).to.exist;
                expect(err).to.be.eql('User test not found');

                done();
            })
        });

        it('Should return false if user don\'t have requested permissions', (done: MochaDone) => {

            let permissionPromises = [];
            permissionPromises.push(permissionManager.hasPermissions(user._id, [Permission.ADMIN]));
            permissionPromises.push(permissionManager.hasPermissions(user._id, [Permission.APPROVE_CIVILIAN, Permission.APPROVE_SOLDIER]));
            permissionPromises.push(permissionManager.hasPermissions(user._id, [Permission.APPROVE_CAR, Permission.APPROVE_SOLDIER]));
            permissionPromises.push(permissionManager.hasPermissions(user._id, [Permission.ADMIN, Permission.APPROVE_CAR, Permission.APPROVE_CIVILIAN], true));

            Promise.all(permissionPromises).then(hasPermissions => {
                hasPermissions.forEach(hasPermission => {
                    expect(hasPermission).to.be.false;
                });
                done();
            });
        });

        it('Should return true when no permissions required', (done: MochaDone) => {
            let permissionPromises = [];
            permissionPromises.push(permissionManager.hasPermissions(user._id, []));
            permissionPromises.push(permissionManager.hasPermissions(user._id, [], true));

            Promise.all(permissionPromises).then(hasPermissions => {
                hasPermissions.forEach(hasPermission => {
                    expect(hasPermission).to.be.true;
                });
                done();
            });
        });

        it('Should return true when user has the required permissions', (done: MochaDone) => {
            let permissionPromises = [];
            permissionPromises.push(permissionManager.hasPermissions(user._id, [Permission.EDIT_USER_PERMISSIONS]));
            permissionPromises.push(permissionManager.hasPermissions(user._id, [Permission.APPROVE_CAR, Permission.APPROVE_SOLDIER], true));
            permissionPromises.push(permissionManager.hasPermissions(user._id, [Permission.EDIT_USER_PERMISSIONS, Permission.APPROVE_SOLDIER]));
            permissionPromises.push(permissionManager.hasPermissions(user._id, [Permission.EDIT_USER_PERMISSIONS, Permission.APPROVE_SOLDIER], true));

            Promise.all(permissionPromises).then(hasPermissions => {
                hasPermissions.forEach(hasPermission => {
                    expect(hasPermission).to.be.true;
                });
                done();
            });
        });

        it('Should return false when user don\'t have enough permissions', (done: MochaDone) => {
            let permissionPromises = [];
            permissionPromises.push(permissionManager.hasPermissions(user._id, [Permission.ADMIN]));
            permissionPromises.push(permissionManager.hasPermissions(user._id, [Permission.ADMIN], true));
            permissionPromises.push(permissionManager.hasPermissions(user._id, [Permission.EDIT_USER_PERMISSIONS, Permission.ADMIN]));
            permissionPromises.push(permissionManager.hasPermissions(user._id, [Permission.EDIT_USER_PERMISSIONS, Permission.APPROVE_SOLDIER, Permission.ADMIN]));
            permissionPromises.push(permissionManager.hasPermissions(user._id, [Permission.APPROVE_SOLDIER, Permission.APPROVE_CIVILIAN]));
            permissionPromises.push(permissionManager.hasPermissions(user._id, [Permission.APPROVE_CIVILIAN, Permission.APPROVE_CAR], true));

            Promise.all(permissionPromises).then(hasPermissions => {
                hasPermissions.forEach(hasPermission => {
                    expect(hasPermission).to.be.false;
                });
                done();
            });
        });

        it('Should return true when user is ADMIN no metter what permission required');
    });

    describe('#hasPermissionForOrganization', () => {

        let user = null;
        let organization1 = null;
        let organization2 = null;

        beforeEach((done: MochaDone) => {

            organizationManager.create(new Organization('org1')).then((org: Organization) => {
                organization1 = org;
            }).then(() => {
                return organizationManager.create(new Organization('org2'));
            }).then((org: Organization) => {
                organization2 = org;
            }).then(() => {
                return userManager.create(new User('Ron', 'Borysovski', 'uid', 'mail'));
            }).then((usr: User) => {
                return permissionManager.setPermissions(usr._id, organization1, [Permission.EDIT_USER_PERMISSIONS]);
            }).then((usr: User) => {
                return permissionManager.setPermissions(usr._id, organization2, [Permission.APPROVE_SOLDIER]);
            }).then((usr: User) => {
                user = usr;
                done();
            });
        });

        it('Should notify when user not found', (done: MochaDone) => {
            permissionManager.hasPermissionForOrganization('test', [], null).catch(err => {
                expect(err).to.exist;
                expect(err).to.eql('User test not found');

                done();
            })
        });

        it('Should return true when no permissions required', (done: MochaDone) => {
            let permissionPromises = [
                permissionManager.hasPermissionForOrganization(user._id, [], organization1._id),
                permissionManager.hasPermissionForOrganization(user._id, [], organization2._id, true)
            ];

            Promise.all(permissionPromises).then(hasPermissions => {
                hasPermissions.forEach(hasPermission => {
                    expect(hasPermission).to.be.true;
                });

                done();
            });
        });

        it('Should return false when user don\'t have required permissions', (done: MochaDone) => {
            let permissionPromises = [
                permissionManager.hasPermissionForOrganization(user._id, [Permission.APPROVE_SOLDIER], organization1._id),
                permissionManager.hasPermissionForOrganization(user._id, [Permission.EDIT_USER_PERMISSIONS], organization2._id, true),
                permissionManager.hasPermissionForOrganization(user._id, [Permission.ADMIN, Permission.APPROVE_CIVILIAN], organization2._id, true),
                permissionManager.hasPermissionForOrganization(user._id, [Permission.EDIT_USER_PERMISSIONS, Permission.APPROVE_CAR], organization1._id),
                permissionManager.hasPermissionForOrganization(user._id, [Permission.EDIT_USER_PERMISSIONS, Permission.APPROVE_SOLDIER], organization2._id)
            ];

            Promise.all(permissionPromises).then(hasPermissions => {
                hasPermissions.forEach(hasPermission => {
                    expect(hasPermission).to.be.false;
                });

                done();
            });
        });

        it('Should return false when user has permission but not for required organization', (done: MochaDone) => {
            let permissionPromises = [
                permissionManager.hasPermissionForOrganization(user._id, [Permission.EDIT_USER_PERMISSIONS], organization2._id, true),
                permissionManager.hasPermissionForOrganization(user._id, [Permission.EDIT_USER_PERMISSIONS], organization2._id),
                permissionManager.hasPermissionForOrganization(user._id, [Permission.APPROVE_SOLDIER], organization1._id, true),
                permissionManager.hasPermissionForOrganization(user._id, [Permission.APPROVE_SOLDIER], organization1._id),
            ];

            Promise.all(permissionPromises).then(hasPermissions => {
                hasPermissions.forEach(hasPermission => {
                    expect(hasPermission).to.be.false;
                });

                done();
            });
        });

        it('Should return true when user has required permissions', (done: MochaDone) => {
            let permissionPromises = [
                permissionManager.hasPermissionForOrganization(user._id, [Permission.EDIT_USER_PERMISSIONS], organization1._id),
                permissionManager.hasPermissionForOrganization(user._id, [Permission.EDIT_USER_PERMISSIONS, Permission.ADMIN], organization1._id, true),
                permissionManager.hasPermissionForOrganization(user._id, [Permission.APPROVE_SOLDIER], organization2._id, true),
                permissionManager.hasPermissionForOrganization(user._id, [Permission.APPROVE_SOLDIER, Permission.EDIT_USER_PERMISSIONS], organization1._id, true),
                permissionManager.hasPermissionForOrganization(user._id, [Permission.APPROVE_SOLDIER, Permission.EDIT_USER_PERMISSIONS], organization2._id, true),
            ];

            Promise.all(permissionPromises).then(hasPermissions => {
                hasPermissions.forEach(hasPermission => {
                    expect(hasPermission).to.be.true;
                });

                done();
            });
        });

        it('Should return true when user is ADMIN no metter what permission required');
    });
});