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

                    userManager.setOrganization('uid', organization).then((user: User) => {
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
        it('Should return false if user don\'t have requested permissions', (done) => {
            let user: User = new User('Ron', 'Borysovski', '123', 'mail');
            organizationManager.create(new Organization('org')).then(organization => {
                userManager.create(user).then(user => {
                    userManager.setOrganization(user._id, organization).then(user => {
                        permissionManager.hasPermissions(user._id, [Permission.ADMIN]).then(hasPermission => {
                            expect(hasPermission).to.be.false;

                            done();
                        });
                    });
                });
            });

        });

        it('Should return true when no permissions required', done => {
            let user: User = new User('Ron', 'Borysovski', '123', 'mail');
            organizationManager.create(new Organization('org')).then(organization => {
                userManager.create(user).then(user => {
                    userManager.setOrganization(user._id, organization).then(user => {
                        permissionManager.hasPermissions(user._id, []).then(hasPermission => {
                            expect(hasPermission).to.be.true;

                            done();
                        });
                    });
                });
            });

        });

        it('Should return true when user has the required permissions', done => {
            let user: User = new User('Ron', 'Borysovski', '123', 'mail');
            // Create org1
            organizationManager.create(new Organization('test')).then(organization => {

                // Create org2
                organizationManager.create(new Organization('test2')).then(organization2 => {

                    // Create user
                    userManager.create(user).then(user => {

                        // Set user organization to org1
                        userManager.setOrganization(user._id, organization).then(user => {

                            // Assign permissions for user's org1
                            permissionManager.setPermissions(user._id, organization,
                                [Permission.APPROVE_CAR,
                                Permission.APPROVE_CIVILIAN,
                                Permission.APPROVE_SOLDIER]).then(user => {

                                    // Assign permissions for user's org2
                                    permissionManager.setPermissions(user._id, organization2,
                                        [Permission.EDIT_USER_PERMISSIONS]).then(user => {

                                            // Check if user has permissions required to org1
                                            permissionManager.hasPermissions(user._id,
                                                [Permission.APPROVE_CAR,
                                                Permission.APPROVE_CIVILIAN]).then(hasPermission => {
                                                    expect(hasPermission).to.be.true;

                                                    // Check if user has some permissions required for org2                                                    
                                                    permissionManager.hasPermissions(user._id,
                                                        [Permission.ADMIN,
                                                        Permission.EDIT_USER_PERMISSIONS], organization2, true).then(hasPermission => {
                                                            expect(hasPermission).to.be.true;

                                                            done();
                                                        });
                                                });
                                        });
                                });
                        });
                    });
                });

            });
        });

        it('Should return false when user don\'t have enough permissions', done => {

            let user: User = new User('Ron', 'Borysovski', '123', 'mail');
            let organization1: Organization = null;
            let organization2: Organization = null;

            organizationManager.create(new Organization('org1')).then((org1: Organization) => {
                organization1 = org1;
                organizationManager.create(new Organization('org2')).then((org2: Organization) => {
                    organization2 = org2;
                });
            }).then(() => {
                userManager.create(user).then((user: User) => {
                    return userManager.setOrganization(user._id, organization1);
                }).then((user: User) => {
                    return permissionManager.setPermissions(user._id, organization1, [Permission.APPROVE_SOLDIER]);
                }).then((user: User) => {
                    return permissionManager.setPermissions(user._id, organization2, [Permission.EDIT_USER_PERMISSIONS, Permission.APPROVE_CIVILIAN]);
                }).then((user: User) => {
                    let permissionPromises: Promise<any>[] = [];
                    permissionPromises.push(permissionManager.hasPermissions(user._id, [Permission.APPROVE_CAR, Permission.APPROVE_SOLDIER]));
                    permissionPromises.push(permissionManager.hasPermissions(user._id, [Permission.APPROVE_CAR, Permission.APPROVE_SOLDIER], organization1));
                    permissionPromises.push(permissionManager.hasPermissions(user._id, [Permission.ADMIN, Permission.EDIT_USER_PERMISSIONS], null, true));
                    permissionPromises.push(permissionManager.hasPermissions(user._id, [Permission.ADMIN, Permission.EDIT_USER_PERMISSIONS], organization1, true));
                    permissionPromises.push(permissionManager.hasPermissions(user._id, [Permission.APPROVE_SOLDIER], organization2));
                    permissionPromises.push(permissionManager.hasPermissions(user._id, [Permission.APPROVE_SOLDIER], organization2, true));
                    permissionPromises.push(permissionManager.hasPermissions(user._id, [Permission.EDIT_USER_PERMISSIONS, Permission.APPROVE_CIVILIAN, Permission.APPROVE_CAR], organization2));
                    permissionPromises.push(permissionManager.hasPermissions(user._id, [Permission.APPROVE_SOLDIER, Permission.ADMIN, Permission.APPROVE_CAR], organization2, true));

                    Promise.all(permissionPromises).then((values: boolean[]) => {
                        values.forEach(value => {
                            expect(value).to.be.false;
                        });

                        done();
                    });
                });
            });

        });
    });
});