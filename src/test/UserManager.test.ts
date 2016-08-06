/// <reference path="../../typings/index.d.ts" />
import { UserManager } from './../server/managers/user.manager';
import { User } from './../server/classes/user';
import { expect } from 'chai';

describe('UserManager', () => {
    var userManager: UserManager = new UserManager();

    describe('#create', () => {
        it('Should create a user', (done) => {
            var newUser: User = new User('John', 'Doe', 'id_1', 'mail1', 'base1');
            userManager.create(newUser, (error, user) => {
                expect(error).to.not.exist;
                expect(user).to.exist;
                expect(user).to.have.property('firstName', 'John');
                expect(user).to.have.property('lastName', 'Doe');
                expect(user).to.have.property('_id', 'id_1');
                expect(user).to.have.property('mail', 'mail1');
                expect(user).to.have.property('base', 'base1');
                return done();
            });
        });
    });

    describe('#all', () => {
        it('Should fetch 0 users when db is empty', (done) => {
            userManager.all((error, users) => {
                expect(error).to.not.exist;
                expect(users).to.be.empty;
                done();
            });
        });
    });

});