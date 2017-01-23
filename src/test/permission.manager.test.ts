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
                        userManager.setOrganization('uid', organization1).then((user: User) => {
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
                                    expect(user.permissions[0]).to.have.property('permissions');
                                    expect(user.permissions[0].permissions).to.have.length(2);
                                    expect(user.permissions[0].permissions).to.have.members([Permission.ADMIN, Permission.APPROVE_CIVILIAN]);
                                    expect(user.permissions[1]).to.have.property('organization');
                                    expect(user.permissions[1].organization).to.have.property('name', organization2.name);
                                    expect(user.permissions[1]).to.have.property('permissions');
                                    expect(user.permissions[1].permissions).to.have.length(2);
                                    expect(user.permissions[1].permissions).to.have.members([Permission.EDIT_USER_PERMISSIONS, Permission.NORMAL_USER]);

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
                    userManager.setOrganization('uid', organization).then((user: User) => {
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
                                        expect(user.permissions[0]).to.have.property('permissions');
                                        expect(user.permissions[0].permissions).to.have.length(1);
                                        expect(user.permissions[0].permissions).to.have.members([Permission.APPROVE_CAR]);
                                        expect(user.permissions[1]).to.have.property('organization');
                                        expect(user.permissions[1].organization).to.have.property('name', organization2.name);
                                        expect(user.permissions[1]).to.have.property('permissions');
                                        expect(user.permissions[1].permissions).to.have.length(1);
                                        expect(user.permissions[1].permissions).to.have.members([Permission.ADMIN]);

                                        done();
                                    });
                                });
                            });
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
                        userManager.setOrganization('uid', organization).then((user: User) => {
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
                                        expect(user.permissions[0]).to.have.property('permissions');
                                        expect(user.permissions[0].permissions).to.have.length(2);
                                        expect(user.permissions[0].permissions).to.have.members([Permission.EDIT_USER_PERMISSIONS, Permission.NORMAL_USER]);

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

    // describe('#hasPermission', () => {
    //     it('Should return false if user don\'t have requested permissions', (done) => {
    //         let user: User = new User('Ron', 'Borysovski', '123', 'mail');
    //         let hasPermission = permissionManager.hasPermissions(user, [Permission.ADMIN]);
    //         expect(hasPermission).to.be.false;
    //         done();
    //     });

    //     it('Should return true when no permissions required', done => {
    //         let user: User = new User('Ron', 'Borysovski', '123', 'mail');
    //         let hasPermission = permissionManager.hasPermissions(user, []);
    //         expect(hasPermission).to.be.true;

    //         user.permissions = [Permission.APPROVE_CAR];
    //         hasPermission = permissionManager.hasPermissions(user, []);
    //         expect(hasPermission).to.be.true;

    //         hasPermission = permissionManager.hasPermissions(user, null);
    //         expect(hasPermission).to.be.true;

    //         done();
    //     });

    //     it('Should return true when user has the right permissions', done => {
    //         let user: User = new User('Ron', 'Borysovski', '123', 'mail');
    //         user.permissions = [Permission.APPROVE_CAR, Permission.APPROVE_SOLDIER];

    //         let hasPermission = permissionManager.hasPermissions(user, []);
    //         expect(hasPermission).to.be.true;

    //         hasPermission = permissionManager.hasPermissions(user, [Permission.APPROVE_CAR]);
    //         expect(hasPermission).to.be.true;

    //         hasPermission = permissionManager.hasPermissions(user, [Permission.APPROVE_SOLDIER]);
    //         expect(hasPermission).to.be.true;

    //         hasPermission = permissionManager.hasPermissions(user, [Permission.APPROVE_CAR, Permission.APPROVE_SOLDIER]);
    //         expect(hasPermission).to.be.true;

    //         done();
    //     });

    //     it('Should return false when user don\'t have enough permissions', done => {
    //         let user: User = new User('Ron', 'Borysovski', '123', 'mail');
    //         user.permissions = [Permission.APPROVE_CAR, Permission.APPROVE_SOLDIER];
    //         let hasPermission = permissionManager.hasPermissions(user, [Permission.ADMIN]);
    //         expect(hasPermission).to.be.false;

    //         hasPermission = permissionManager.hasPermissions(user, [Permission.APPROVE_CAR, Permission.ADMIN]);
    //         expect(hasPermission).to.be.false;

    //         hasPermission = permissionManager.hasPermissions(user, [Permission.APPROVE_SOLDIER, Permission.APPROVE_CIVILIAN]);
    //         expect(hasPermission).to.be.false;

    //         hasPermission = permissionManager.hasPermissions(user, [Permission.APPROVE_CAR, Permission.APPROVE_SOLDIER, Permission.NORMAL_USER]);
    //         expect(hasPermission).to.be.false;

    //         done();
    //     });
    // });

});