/// <reference path="../../typings/index.d.ts" />
import { UserManager } from './../server/managers/user.manager';
import { PermissionManager } from './../server/managers/permission.manager';
import { User } from './../server/classes/user';
import { Permission } from './../server/classes/permission';
import { expect } from 'chai';

describe('PermissionManager', () => {
    let permissionManager: PermissionManager = new PermissionManager();
    let userManager: UserManager = new UserManager();

    describe('#hasPermission', () => {
        it('Should return false if user don\'t have requested permissions', (done) => {
            let user: User = new User('Ron', 'Borysovski', '123', 'mail', 'base');
            let hasPermission = permissionManager.hasPermissions(user, [Permission.ADMIN]);
            expect(hasPermission).to.be.false;
            done();
        });

        it('Should return true when no permissions required', done => {
            let user: User = new User('Ron', 'Borysovski', '123', 'mail', 'base');
            let hasPermission = permissionManager.hasPermissions(user, []);
            expect(hasPermission).to.be.true;

            user.permissions = [Permission.APPROVE_CAR];
            hasPermission = permissionManager.hasPermissions(user, []);
            expect(hasPermission).to.be.true;

            hasPermission = permissionManager.hasPermissions(user, null);
            expect(hasPermission).to.be.true;

            done();
        });

        it('Should return true when user has the right permissions', done => {
            let user: User = new User('Ron', 'Borysovski', '123', 'mail', 'base', [Permission.APPROVE_CAR, Permission.APPROVE_SOLDIER]);
            let hasPermission = permissionManager.hasPermissions(user, []);
            expect(hasPermission).to.be.true;

            hasPermission = permissionManager.hasPermissions(user, [Permission.APPROVE_CAR]);
            expect(hasPermission).to.be.true;

            hasPermission = permissionManager.hasPermissions(user, [Permission.APPROVE_SOLDIER]);
            expect(hasPermission).to.be.true;

            hasPermission = permissionManager.hasPermissions(user, [Permission.APPROVE_CAR, Permission.APPROVE_SOLDIER]);
            expect(hasPermission).to.be.true;

            done();
        });

        it('Should return false when user don\'t have enough permissions', done => {
            let user: User = new User('Ron', 'Borysovski', '123', 'mail', 'base', [Permission.APPROVE_CAR, Permission.APPROVE_SOLDIER]);
            let hasPermission = permissionManager.hasPermissions(user, [Permission.ADMIN]);
            expect(hasPermission).to.be.false;

            hasPermission = permissionManager.hasPermissions(user, [Permission.APPROVE_CAR, Permission.ADMIN]);
            expect(hasPermission).to.be.false;

            hasPermission = permissionManager.hasPermissions(user, [Permission.APPROVE_SOLDIER, Permission.APPROVE_CIVILIAN]);
            expect(hasPermission).to.be.false;

            hasPermission = permissionManager.hasPermissions(user, [Permission.APPROVE_CAR, Permission.APPROVE_SOLDIER, Permission.NORMAL_USER]);
            console.log(hasPermission);
            expect(hasPermission).to.be.false;

            done();
        });
    });

    describe('#addPermission', () => {
        it('Should do nothing when user not in DB', done => {
            let user: User = new User('Ron', 'Borysovski', '123', 'mail', 'base');
            permissionManager.addPermissions(user, Permission.ADMIN).then((user: User) => {
                expect(user).to.not.exist;
                done();
            });
        });

        it('Should do nothing when no permissions are passed', done => {
            userManager.create(new User('Ron', 'Borysovski', '123', 'mail', 'base')).then((user: User) => {
                expect(user).to.exist;
                expect(user.permissions).to.exist;
                expect(user.permissions.length).to.eql(0);

                permissionManager.addPermissions(user).then((user: User) => {
                    expect(user).to.exist;
                    expect(user.permissions).to.exist;
                    expect(user.permissions).to.have.length(0);

                    done();
                });
            });
        });

        it('Should add single permission to existing user', done => {
            userManager.create(new User('Ron', 'Borysovski', '123', 'mail', 'base')).then((user: User) => {
                expect(user).to.exist;
                expect(user.permissions).to.exist;
                expect(user.permissions.length).to.eql(0);

                permissionManager.addPermissions(user, Permission.APPROVE_CAR).then((user: User) => {
                    expect(user).to.exist;
                    expect(user.permissions).to.exist;
                    expect(user.permissions).to.have.length(1);
                    expect(user.permissions).to.have.members([Permission.APPROVE_CAR]);

                    done();
                });
            });
        });

        it('Should add multiple permissions to existing user', done => {
            userManager.create(new User('Ron', 'Borysovski', '123', 'mail', 'base')).then((user: User) => {
                expect(user).to.exist;
                expect(user.permissions).to.exist;
                expect(user.permissions.length).to.eql(0);

                permissionManager.addPermissions(user, ...[Permission.APPROVE_CAR, Permission.EDIT_USER_PERMISSIONS, Permission.APPROVE_CIVILIAN]).then((user: User) => {
                    expect(user).to.exist;
                    expect(user.permissions).to.exist;
                    expect(user.permissions).to.have.length(3);
                    expect(user.permissions).to.have.members([Permission.EDIT_USER_PERMISSIONS, Permission.APPROVE_CIVILIAN, Permission.APPROVE_CAR]);

                    done();
                });
            });
        });

        it('Should not add duplicate permissions if already exists', done => {
            userManager.create(new User('Ron', 'Borysovski', '123', 'mail', 'base')).then((user: User) => {
                expect(user).to.exist;
                expect(user.permissions).to.exist;
                expect(user.permissions.length).to.eql(0);

                permissionManager.addPermissions(user, Permission.ADMIN, Permission.ADMIN).then((user: User) => {
                    expect(user).to.exist;
                    expect(user.permissions).to.exist;
                    expect(user.permissions).to.have.length(1);
                    expect(user.permissions).to.have.members([Permission.ADMIN]);

                    done();
                });
            });
        });
    });

    describe('#removePermissions', () => {
        it('Should do nothing when user not exists in DB', done => {
            let user: User = new User('Ron', 'Borysovski', '123', 'mail', 'base');
            permissionManager.removePermissions(user, Permission.ADMIN).then((user: User) => {
                expect(user).to.not.exist;
                done();
            });
        });

        it('Should do nothing when user doesn\'t have the permissions to delete', done => {
            userManager.create(new User('Ron', 'Borysovski', '123', 'mail', 'base')).then((user: User) => {
                permissionManager.removePermissions(user, Permission.ADMIN).then((user: User) => {
                    expect(user).to.exist;
                    expect(user).to.have.property('permissions');
                    expect(user.permissions).to.have.length(0);
                    done();
                });
            });
        });

        it('Should remove a single permission when exists', done => {
            userManager.create(new User('Ron', 'Borysovski', '123', 'mail', 'base')).then((user: User) => {
                permissionManager.addPermissions(user, Permission.ADMIN, Permission.APPROVE_CAR).then((user: User) => {
                    expect(user).to.exist;
                    expect(user.permissions).to.exist;
                    expect(user.permissions).to.have.length(2);

                    permissionManager.removePermissions(user, Permission.ADMIN).then((user: User) => {
                        expect(user).to.exist;
                        expect(user.permissions).to.exist;
                        expect(user.permissions).to.have.length(1);
                        expect(user.permissions).to.not.have.members([Permission.ADMIN]);

                        done();
                    });
                });
            });
        });

        it('Should remove multiple permission when exists', done => {
            userManager.create(new User('Ron', 'Borysovski', '123', 'mail', 'base')).then((user: User) => {
                permissionManager.addPermissions(user, Permission.EDIT_USER_PERMISSIONS, Permission.ADMIN, Permission.APPROVE_CAR).then((user: User) => {
                    expect(user).to.exist;
                    expect(user.permissions).to.exist;
                    expect(user.permissions).to.have.length(3);

                    permissionManager.removePermissions(user, Permission.ADMIN, Permission.EDIT_USER_PERMISSIONS).then((user: User) => {
                        expect(user).to.exist;
                        expect(user.permissions).to.exist;
                        expect(user.permissions).to.have.length(1);
                        expect(user.permissions).to.not.have.members([Permission.ADMIN, Permission.EDIT_USER_PERMISSIONS]);

                        done();
                    });
                });
            });
        });
    });

    describe('#setPermissions', () => {
        it('Should do nothing when user not exists in DB', done => {
            permissionManager.setPermissions('123', [Permission.ADMIN]).then((user: User) => {
                expect(user).to.not.exist;
                done();
            });
        });

        it('Should remove all permissions when no permissions passed', done => {
            userManager.create(new User('Ron', 'Borysovski', '123', 'mail', 'base')).then((user: User) => {
                permissionManager.addPermissions(user, ...[Permission.ADMIN, Permission.APPROVE_CAR]).then(user => {
                    expect(user.permissions).to.have.length(2);
                    permissionManager.setPermissions(user._id, []).then((user: User) => {
                        expect(user).to.exist;
                        expect(user.permissions).to.have.length(0);
                        done();
                    });
                });
            });
        });

        it('Should set permissions', done => {
            userManager.create(new User('Ron', 'Borysovski', '123', 'mail', 'base')).then((user: User) => {
                permissionManager.setPermissions(user._id, [Permission.ADMIN, Permission.APPROVE_CAR, Permission.APPROVE_SOLDIER]).then((user: User) => {
                    expect(user).to.exist;
                    expect(user.permissions).to.have.length(3);
                    expect(user.permissions).to.have.members([Permission.ADMIN, Permission.APPROVE_CAR, Permission.APPROVE_SOLDIER]);
                    done();
                });
            });
        });

        it('Should not set duplicate permissions', done => {
            userManager.create(new User('Ron', 'Borysovski', '123', 'mail', 'base')).then((user: User) => {
                permissionManager.setPermissions(user._id, [Permission.ADMIN, Permission.APPROVE_CAR, Permission.ADMIN]).then((user: User) => {
                    expect(user).to.exist;
                    expect(user.permissions).to.have.length(2);
                    expect(user.permissions).to.have.members([Permission.ADMIN, Permission.APPROVE_CAR]);
                    done();
                });
            });
        });
    });
});