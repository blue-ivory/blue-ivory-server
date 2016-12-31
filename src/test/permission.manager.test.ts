/// <reference path="../../typings/index.d.ts" />
import { UserManager } from './../server/managers/user.manager';
import { PermissionManager } from './../server/managers/permission.manager';
import { User } from './../server/classes/user';
import { Permission } from './../server/classes/permission';
import { expect } from 'chai';

describe('PermissionManager', () => {
    let permissionManager: PermissionManager = new PermissionManager();

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
});