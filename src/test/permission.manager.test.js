"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_manager_1 = require("./../server/managers/user.manager");
const permission_manager_1 = require("./../server/managers/permission.manager");
const organization_manager_1 = require("./../server/managers/organization.manager");
const user_1 = require("./../server/classes/user");
const organization_1 = require("./../server/classes/organization");
const permission_1 = require("./../server/classes/permission");
const chai_1 = require("chai");
describe('PermissionManager', () => {
    let permissionManager = new permission_manager_1.PermissionManager();
    let userManager = new user_manager_1.UserManager();
    let organizationManager = new organization_manager_1.OrganizationManager();
    describe('#setPermissions', () => {
        it('Should do nothing when user not exists in DB', done => {
            organizationManager.create(new organization_1.Organization('test')).then(organization => {
                chai_1.expect(organization).to.exist;
                permissionManager.setPermissions('123', organization, [permission_1.Permission.APPROVE_CAR]).catch(err => {
                    chai_1.expect(err).to.exist;
                    chai_1.expect(err).to.eql('User not found');
                    done();
                });
            });
        });
        it('Should set permissions', done => {
            organizationManager.create(new organization_1.Organization('test1')).then((organization1) => {
                chai_1.expect(organization1).to.exist;
                organizationManager.create(new organization_1.Organization('test2')).then((organization2) => {
                    chai_1.expect(organization2).to.exist;
                    userManager.create(new user_1.User('fName', 'lName', 'uid', 'mail')).then((user) => {
                        chai_1.expect(user).to.exist;
                        userManager.setOrganization('uid', organization1._id).then((user) => {
                            chai_1.expect(user).to.exist;
                            permissionManager.setPermissions('uid', organization1, [permission_1.Permission.EDIT_WORKFLOW, permission_1.Permission.APPROVE_CIVILIAN]).then((user) => {
                                chai_1.expect(user).to.exist;
                                permissionManager.setPermissions('uid', organization2, [permission_1.Permission.EDIT_USER_PERMISSIONS, permission_1.Permission.NORMAL_USER]).then((user) => {
                                    chai_1.expect(user).to.exist;
                                    chai_1.expect(user).to.have.property('permissions');
                                    chai_1.expect(user.permissions).to.be.an('array');
                                    chai_1.expect(user.permissions).to.have.length(2);
                                    chai_1.expect(user.permissions[0]).to.have.property('organization');
                                    chai_1.expect(user.permissions[0].organization).to.have.property('name', organization1.name);
                                    chai_1.expect(user.permissions[0]).to.have.property('organizationPermissions');
                                    chai_1.expect(user.permissions[0].organizationPermissions).to.have.length(2);
                                    chai_1.expect(user.permissions[0].organizationPermissions).to.have.members([permission_1.Permission.EDIT_WORKFLOW, permission_1.Permission.APPROVE_CIVILIAN]);
                                    chai_1.expect(user.permissions[1]).to.have.property('organization');
                                    chai_1.expect(user.permissions[1].organization).to.have.property('name', organization2.name);
                                    chai_1.expect(user.permissions[1]).to.have.property('organizationPermissions');
                                    chai_1.expect(user.permissions[1].organizationPermissions).to.have.length(2);
                                    chai_1.expect(user.permissions[1].organizationPermissions).to.have.members([permission_1.Permission.EDIT_USER_PERMISSIONS, permission_1.Permission.NORMAL_USER]);
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });
        it('Should update permissions for organization and not create multiple instances', done => {
            organizationManager.create(new organization_1.Organization('test1')).then((organization) => {
                chai_1.expect(organization).to.exist;
                userManager.create(new user_1.User('fName', 'lName', 'uid', 'mail')).then((user) => {
                    chai_1.expect(user).to.exist;
                    userManager.setOrganization('uid', organization._id).then((user) => {
                        chai_1.expect(user).to.exist;
                        permissionManager.setPermissions('uid', organization, [permission_1.Permission.EDIT_WORKFLOW, permission_1.Permission.APPROVE_SOLDIER]).then((user) => {
                            chai_1.expect(user).to.exist;
                            permissionManager.setPermissions('uid', organization, [permission_1.Permission.APPROVE_CAR]).then((user) => {
                                chai_1.expect(user).to.exist;
                                organizationManager.create(new organization_1.Organization('o')).then(organization2 => {
                                    permissionManager.setPermissions('uid', organization2, [permission_1.Permission.EDIT_WORKFLOW]).then(user => {
                                        chai_1.expect(user).to.exist;
                                        chai_1.expect(user).to.have.property('permissions');
                                        chai_1.expect(user.permissions).to.be.an('array');
                                        chai_1.expect(user.permissions).to.have.length(2);
                                        chai_1.expect(user.permissions[0]).to.have.property('organization');
                                        chai_1.expect(user.permissions[0].organization).to.have.property('name', organization.name);
                                        chai_1.expect(user.permissions[0]).to.have.property('organizationPermissions');
                                        chai_1.expect(user.permissions[0].organizationPermissions).to.have.length(1);
                                        chai_1.expect(user.permissions[0].organizationPermissions).to.have.members([permission_1.Permission.APPROVE_CAR]);
                                        chai_1.expect(user.permissions[1]).to.have.property('organization');
                                        chai_1.expect(user.permissions[1].organization).to.have.property('name', organization2.name);
                                        chai_1.expect(user.permissions[1]).to.have.property('organizationPermissions');
                                        chai_1.expect(user.permissions[1].organizationPermissions).to.have.length(1);
                                        chai_1.expect(user.permissions[1].organizationPermissions).to.have.members([permission_1.Permission.EDIT_WORKFLOW]);
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
            organizationManager.create(new organization_1.Organization('test')).then(organization => {
                chai_1.expect(organization).to.exist;
                userManager.create(new user_1.User('fName', 'lName', 'uid', 'mail')).then((user) => {
                    chai_1.expect(user).to.exist;
                    userManager.setOrganization('uid', organization._id).then((user) => {
                        chai_1.expect(user).to.exist;
                        permissionManager.setPermissions('uid', organization, []).then((user) => {
                            chai_1.expect(user).to.exist;
                            chai_1.expect(user).to.have.property('permissions');
                            chai_1.expect(user.permissions).to.be.an('array');
                            chai_1.expect(user.permissions).to.have.length(0);
                            done();
                        });
                    });
                });
            });
        });
        it('Should remove all permissions when no permissions passed', done => {
            organizationManager.create(new organization_1.Organization('test1')).then((organization) => {
                chai_1.expect(organization).to.exist;
                organizationManager.create(new organization_1.Organization('test2')).then((organization2) => {
                    chai_1.expect(organization2).to.exist;
                    userManager.create(new user_1.User('fName', 'lName', 'uid', 'mail')).then((user) => {
                        chai_1.expect(user).to.exist;
                        userManager.setOrganization('uid', organization._id).then((user) => {
                            chai_1.expect(user).to.exist;
                            permissionManager.setPermissions('uid', organization, [permission_1.Permission.EDIT_WORKFLOW, permission_1.Permission.APPROVE_SOLDIER]).then((user) => {
                                chai_1.expect(user).to.exist;
                                permissionManager.setPermissions('uid', organization2, [permission_1.Permission.EDIT_USER_PERMISSIONS, permission_1.Permission.NORMAL_USER]).then((user) => {
                                    chai_1.expect(user).to.exist;
                                    permissionManager.setPermissions('uid', organization, []).then((user) => {
                                        chai_1.expect(user).to.exist;
                                        chai_1.expect(user).to.have.property('permissions');
                                        chai_1.expect(user.permissions).to.be.an('array');
                                        chai_1.expect(user.permissions).to.have.length(1);
                                        chai_1.expect(user.permissions[0]).to.have.property('organization');
                                        chai_1.expect(user.permissions[0].organization).to.have.property('name', organization2.name);
                                        chai_1.expect(user.permissions[0]).to.have.property('organizationPermissions');
                                        chai_1.expect(user.permissions[0].organizationPermissions).to.have.length(2);
                                        chai_1.expect(user.permissions[0].organizationPermissions).to.have.members([permission_1.Permission.EDIT_USER_PERMISSIONS, permission_1.Permission.NORMAL_USER]);
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
        beforeEach((done) => {
            let organization1 = null;
            let organization2 = null;
            organizationManager.create(new organization_1.Organization('org1')).then((org) => {
                organization1 = org;
            }).then(() => {
                return organizationManager.create(new organization_1.Organization('org2'));
            }).then((org) => {
                organization2 = org;
            }).then(() => {
                return userManager.create(new user_1.User('Ron', 'Borysovski', 'uid', 'mail'));
            }).then((usr) => {
                return permissionManager.setPermissions(usr._id, organization1, [permission_1.Permission.EDIT_USER_PERMISSIONS]);
            }).then((usr) => {
                return permissionManager.setPermissions(usr._id, organization2, [permission_1.Permission.APPROVE_SOLDIER]);
            }).then((usr) => {
                user = usr;
                done();
            });
        });
        it('Should notify when user not exists', (done) => {
            permissionManager.hasPermissions('test', []).catch(err => {
                chai_1.expect(err).to.exist;
                chai_1.expect(err).to.be.eql('User test not found');
                done();
            });
        });
        it('Should return false if user don\'t have requested permissions', (done) => {
            let permissionPromises = [];
            permissionPromises.push(permissionManager.hasPermissions(user._id, [permission_1.Permission.EDIT_WORKFLOW]));
            permissionPromises.push(permissionManager.hasPermissions(user._id, [permission_1.Permission.APPROVE_CIVILIAN, permission_1.Permission.APPROVE_SOLDIER]));
            permissionPromises.push(permissionManager.hasPermissions(user._id, [permission_1.Permission.APPROVE_CAR, permission_1.Permission.APPROVE_SOLDIER]));
            permissionPromises.push(permissionManager.hasPermissions(user._id, [permission_1.Permission.EDIT_WORKFLOW, permission_1.Permission.APPROVE_CAR, permission_1.Permission.APPROVE_CIVILIAN], true));
            Promise.all(permissionPromises).then(hasPermissions => {
                hasPermissions.forEach(hasPermission => {
                    chai_1.expect(hasPermission).to.be.false;
                });
                done();
            });
        });
        it('Should return true when no permissions required', (done) => {
            let permissionPromises = [];
            permissionPromises.push(permissionManager.hasPermissions(user._id, []));
            permissionPromises.push(permissionManager.hasPermissions(user._id, [], true));
            Promise.all(permissionPromises).then(hasPermissions => {
                hasPermissions.forEach(hasPermission => {
                    chai_1.expect(hasPermission).to.be.true;
                });
                done();
            });
        });
        it('Should return true when user has the required permissions', (done) => {
            let permissionPromises = [];
            permissionPromises.push(permissionManager.hasPermissions(user._id, [permission_1.Permission.EDIT_USER_PERMISSIONS]));
            permissionPromises.push(permissionManager.hasPermissions(user._id, [permission_1.Permission.APPROVE_CAR, permission_1.Permission.APPROVE_SOLDIER], true));
            permissionPromises.push(permissionManager.hasPermissions(user._id, [permission_1.Permission.EDIT_USER_PERMISSIONS, permission_1.Permission.APPROVE_SOLDIER]));
            permissionPromises.push(permissionManager.hasPermissions(user._id, [permission_1.Permission.EDIT_USER_PERMISSIONS, permission_1.Permission.APPROVE_SOLDIER], true));
            Promise.all(permissionPromises).then(hasPermissions => {
                hasPermissions.forEach(hasPermission => {
                    chai_1.expect(hasPermission).to.be.true;
                });
                done();
            });
        });
        it('Should return false when user don\'t have enough permissions', (done) => {
            let permissionPromises = [];
            permissionPromises.push(permissionManager.hasPermissions(user._id, [permission_1.Permission.EDIT_WORKFLOW]));
            permissionPromises.push(permissionManager.hasPermissions(user._id, [permission_1.Permission.EDIT_WORKFLOW], true));
            permissionPromises.push(permissionManager.hasPermissions(user._id, [permission_1.Permission.EDIT_USER_PERMISSIONS, permission_1.Permission.EDIT_WORKFLOW]));
            permissionPromises.push(permissionManager.hasPermissions(user._id, [permission_1.Permission.EDIT_USER_PERMISSIONS, permission_1.Permission.APPROVE_SOLDIER, permission_1.Permission.EDIT_WORKFLOW]));
            permissionPromises.push(permissionManager.hasPermissions(user._id, [permission_1.Permission.APPROVE_SOLDIER, permission_1.Permission.APPROVE_CIVILIAN]));
            permissionPromises.push(permissionManager.hasPermissions(user._id, [permission_1.Permission.APPROVE_CIVILIAN, permission_1.Permission.APPROVE_CAR], true));
            Promise.all(permissionPromises).then(hasPermissions => {
                hasPermissions.forEach(hasPermission => {
                    chai_1.expect(hasPermission).to.be.false;
                });
                done();
            });
        });
        it('Should return true when user is EDIT_WORKFLOW no metter what permission required', done => {
            let admin = new user_1.User('admin', 'admin', 'admin', 'admin');
            admin.isAdmin = true;
            userManager.create(admin).then(user => {
                chai_1.expect(user).to.exist;
                chai_1.expect(user).to.have.property('isAdmin', true);
                let permissionPromises = [
                    permissionManager.hasPermissions(user._id, [permission_1.Permission.NORMAL_USER]),
                    permissionManager.hasPermissions(user._id, [permission_1.Permission.APPROVE_CAR]),
                    permissionManager.hasPermissions(user._id, [permission_1.Permission.APPROVE_CIVILIAN]),
                    permissionManager.hasPermissions(user._id, [permission_1.Permission.APPROVE_SOLDIER]),
                    permissionManager.hasPermissions(user._id, [permission_1.Permission.EDIT_USER_PERMISSIONS]),
                    permissionManager.hasPermissions(user._id, [permission_1.Permission.EDIT_WORKFLOW]),
                    permissionManager.hasPermissions(user._id, [permission_1.Permission.NORMAL_USER]),
                    permissionManager.hasPermissions(user._id, [permission_1.Permission.APPROVE_CAR]),
                    permissionManager.hasPermissions(user._id, [permission_1.Permission.APPROVE_CIVILIAN]),
                    permissionManager.hasPermissions(user._id, [permission_1.Permission.APPROVE_SOLDIER]),
                    permissionManager.hasPermissions(user._id, [permission_1.Permission.EDIT_USER_PERMISSIONS]),
                    permissionManager.hasPermissions(user._id, [permission_1.Permission.EDIT_WORKFLOW])
                ];
                Promise.all(permissionPromises).then(hasPermissions => {
                    hasPermissions.forEach(hasPermission => {
                        chai_1.expect(hasPermission).to.be.true;
                    });
                    done();
                });
            });
        });
    });
    describe('#hasPermissionForOrganization', () => {
        let user = null;
        let organization1 = null;
        let organization2 = null;
        beforeEach((done) => {
            organizationManager.create(new organization_1.Organization('org1')).then((org) => {
                organization1 = org;
            }).then(() => {
                return organizationManager.create(new organization_1.Organization('org2'));
            }).then((org) => {
                organization2 = org;
            }).then(() => {
                return userManager.create(new user_1.User('Ron', 'Borysovski', 'uid', 'mail'));
            }).then((usr) => {
                return permissionManager.setPermissions(usr._id, organization1, [permission_1.Permission.EDIT_USER_PERMISSIONS]);
            }).then((usr) => {
                return permissionManager.setPermissions(usr._id, organization2, [permission_1.Permission.APPROVE_SOLDIER]);
            }).then((usr) => {
                user = usr;
                done();
            });
        });
        it('Should notify when user not found', (done) => {
            permissionManager.hasPermissionForOrganization('test', [], null).catch(err => {
                chai_1.expect(err).to.exist;
                chai_1.expect(err).to.eql('User test not found');
                done();
            });
        });
        it('Should return true when no permissions required', (done) => {
            let permissionPromises = [
                permissionManager.hasPermissionForOrganization(user._id, [], organization1._id),
                permissionManager.hasPermissionForOrganization(user._id, [], organization2._id, true)
            ];
            Promise.all(permissionPromises).then(hasPermissions => {
                hasPermissions.forEach(hasPermission => {
                    chai_1.expect(hasPermission).to.be.true;
                });
                done();
            });
        });
        it('Should return false when user don\'t have required permissions', (done) => {
            let permissionPromises = [
                permissionManager.hasPermissionForOrganization(user._id, [permission_1.Permission.APPROVE_SOLDIER], organization1._id),
                permissionManager.hasPermissionForOrganization(user._id, [permission_1.Permission.EDIT_USER_PERMISSIONS], organization2._id, true),
                permissionManager.hasPermissionForOrganization(user._id, [permission_1.Permission.EDIT_WORKFLOW, permission_1.Permission.APPROVE_CIVILIAN], organization2._id, true),
                permissionManager.hasPermissionForOrganization(user._id, [permission_1.Permission.EDIT_USER_PERMISSIONS, permission_1.Permission.APPROVE_CAR], organization1._id),
                permissionManager.hasPermissionForOrganization(user._id, [permission_1.Permission.EDIT_USER_PERMISSIONS, permission_1.Permission.APPROVE_SOLDIER], organization2._id)
            ];
            Promise.all(permissionPromises).then(hasPermissions => {
                hasPermissions.forEach(hasPermission => {
                    chai_1.expect(hasPermission).to.be.false;
                });
                done();
            });
        });
        it('Should return false when user has permission but not for required organization', (done) => {
            let permissionPromises = [
                permissionManager.hasPermissionForOrganization(user._id, [permission_1.Permission.EDIT_USER_PERMISSIONS], organization2._id, true),
                permissionManager.hasPermissionForOrganization(user._id, [permission_1.Permission.EDIT_USER_PERMISSIONS], organization2._id),
                permissionManager.hasPermissionForOrganization(user._id, [permission_1.Permission.APPROVE_SOLDIER], organization1._id, true),
                permissionManager.hasPermissionForOrganization(user._id, [permission_1.Permission.APPROVE_SOLDIER], organization1._id),
            ];
            Promise.all(permissionPromises).then(hasPermissions => {
                hasPermissions.forEach(hasPermission => {
                    chai_1.expect(hasPermission).to.be.false;
                });
                done();
            });
        });
        it('Should return true when user has required permissions', (done) => {
            let permissionPromises = [
                permissionManager.hasPermissionForOrganization(user._id, [permission_1.Permission.EDIT_USER_PERMISSIONS], organization1._id),
                permissionManager.hasPermissionForOrganization(user._id, [permission_1.Permission.EDIT_USER_PERMISSIONS, permission_1.Permission.EDIT_WORKFLOW], organization1._id, true),
                permissionManager.hasPermissionForOrganization(user._id, [permission_1.Permission.APPROVE_SOLDIER], organization2._id, true),
                permissionManager.hasPermissionForOrganization(user._id, [permission_1.Permission.APPROVE_SOLDIER, permission_1.Permission.EDIT_USER_PERMISSIONS], organization1._id, true),
                permissionManager.hasPermissionForOrganization(user._id, [permission_1.Permission.APPROVE_SOLDIER, permission_1.Permission.EDIT_USER_PERMISSIONS], organization2._id, true),
            ];
            Promise.all(permissionPromises).then(hasPermissions => {
                hasPermissions.forEach(hasPermission => {
                    chai_1.expect(hasPermission).to.be.true;
                });
                done();
            });
        });
        it('Should return true when user is ADMIN no metter what permission required', done => {
            let admin = new user_1.User('admin', 'admin', 'admin', 'admin');
            admin.isAdmin = true;
            userManager.create(admin).then(user => {
                chai_1.expect(user).to.exist;
                chai_1.expect(user).to.have.property('isAdmin', true);
                let permissionPromises = [
                    permissionManager.hasPermissionForOrganization(user._id, [permission_1.Permission.NORMAL_USER], organization1._id),
                    permissionManager.hasPermissionForOrganization(user._id, [permission_1.Permission.APPROVE_CAR], organization1._id),
                    permissionManager.hasPermissionForOrganization(user._id, [permission_1.Permission.APPROVE_CIVILIAN], organization1._id),
                    permissionManager.hasPermissionForOrganization(user._id, [permission_1.Permission.APPROVE_SOLDIER], organization1._id),
                    permissionManager.hasPermissionForOrganization(user._id, [permission_1.Permission.EDIT_USER_PERMISSIONS], organization1._id),
                    permissionManager.hasPermissionForOrganization(user._id, [permission_1.Permission.EDIT_WORKFLOW], organization1._id),
                    permissionManager.hasPermissionForOrganization(user._id, [permission_1.Permission.NORMAL_USER], organization2._id),
                    permissionManager.hasPermissionForOrganization(user._id, [permission_1.Permission.APPROVE_CAR], organization2._id),
                    permissionManager.hasPermissionForOrganization(user._id, [permission_1.Permission.APPROVE_CIVILIAN], organization2._id),
                    permissionManager.hasPermissionForOrganization(user._id, [permission_1.Permission.APPROVE_SOLDIER], organization2._id),
                    permissionManager.hasPermissionForOrganization(user._id, [permission_1.Permission.EDIT_USER_PERMISSIONS], organization2._id),
                    permissionManager.hasPermissionForOrganization(user._id, [permission_1.Permission.EDIT_WORKFLOW], organization2._id)
                ];
                Promise.all(permissionPromises).then(hasPermissions => {
                    hasPermissions.forEach(hasPermission => {
                        chai_1.expect(hasPermission).to.be.true;
                    });
                    done();
                });
            });
        });
    });
});
