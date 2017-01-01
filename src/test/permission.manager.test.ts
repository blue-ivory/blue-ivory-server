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
                expect(user.permissions.length).to.eql(1);
                expect(user.permissions[0]).to.eql(Permission.NORMAL_USER);

                permissionManager.addPermissions(user).then((user: User) => {
                    expect(user).to.exist;
                    expect(user.permissions).to.exist;
                    expect(user.permissions).to.have.length(1);
                    expect(user.permissions).to.have.members([Permission.NORMAL_USER]);

                    done();
                });
            });
        });

        it('Should add single permission to existing user', done => {
            userManager.create(new User('Ron', 'Borysovski', '123', 'mail', 'base')).then((user: User) => {
                expect(user).to.exist;
                expect(user.permissions).to.exist;
                expect(user.permissions.length).to.eql(1);
                expect(user.permissions[0]).to.eql(Permission.NORMAL_USER);

                permissionManager.addPermissions(user, Permission.APPROVE_CAR).then((user: User) => {
                    expect(user).to.exist;
                    expect(user.permissions).to.exist;
                    expect(user.permissions).to.have.length(2);
                    expect(user.permissions).to.have.members([Permission.NORMAL_USER, Permission.APPROVE_CAR]);

                    done();
                });
            });
        });

        it('Should add multiple permissions to existing user', done => {
            userManager.create(new User('Ron', 'Borysovski', '123', 'mail', 'base')).then((user: User) => {
                expect(user).to.exist;
                expect(user.permissions).to.exist;
                expect(user.permissions.length).to.eql(1);
                expect(user.permissions[0]).to.eql(Permission.NORMAL_USER);

                permissionManager.addPermissions(user, Permission.APPROVE_CAR, Permission.EDIT_USER_PERMISSIONS, Permission.APPROVE_CIVILIAN).then((user: User) => {
                    expect(user).to.exist;
                    expect(user.permissions).to.exist;
                    expect(user.permissions).to.have.length(4);
                    expect(user.permissions).to.have.members([Permission.NORMAL_USER, Permission.EDIT_USER_PERMISSIONS, Permission.APPROVE_CIVILIAN, Permission.APPROVE_CAR]);

                    done();
                });
            });
        });

        it('Should not add duplicate permissions if already exists', done => {
            userManager.create(new User('Ron', 'Borysovski', '123', 'mail', 'base')).then((user: User) => {
                expect(user).to.exist;
                expect(user.permissions).to.exist;
                expect(user.permissions.length).to.eql(1);
                expect(user.permissions[0]).to.eql(Permission.NORMAL_USER);

                permissionManager.addPermissions(user, Permission.ADMIN, Permission.ADMIN).then((user: User) => {
                    expect(user).to.exist;
                    expect(user.permissions).to.exist;
                    expect(user.permissions).to.have.length(2);
                    expect(user.permissions).to.have.members([Permission.NORMAL_USER, Permission.ADMIN]);

                    done();
                });
            });
        });
    });
});