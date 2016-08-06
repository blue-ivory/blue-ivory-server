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
                done();
            });
        });

        it('Should throw an error when same ID or mail is given', (done) => {
            var newUser1: User = new User('John', 'Doe', 'id_1', 'mail1', 'base1');
            var newUser2: User = new User('Test', 'Doe', 'id_1', 'mail1', 'base1');
            userManager.create(newUser1, (error, user) => {
                expect(error).to.not.exist;
                expect(user).to.exist;
                userManager.create(newUser2, (error, user2) => {
                    expect(error).to.exist;
                    expect(user2).to.not.exist;
                    done();
                });
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

        it('Should fetch all users from db', (done) => {
            let temp: number = 0;
            for (let i = 0; i < 5; i++) {
                var newUser: User = new User('John', 'Doe', 'id_' + i, 'mail' + i, 'base' + i);
                userManager.create(newUser, (error, user) => {
                    temp++;

                    if (temp == 4) {
                        userManager.all((error, users) => {
                            expect(error).to.not.exist;
                            expect(users.length).to.equal(5);
                            done();
                        })
                    }
                });
            }
        });
    });

    describe('#read', () => {
        it('Should not return user (if not exists)', (done) => {
            userManager.read("id", (error, user) => {
                expect(error).to.not.exist;
                expect(user).to.not.exist;
                done();
            });
        });

        it('Should return the user (if exists)', (done) => {
            var newUser: User = new User('John', 'Doe', 'id_1', 'mail1', 'base1');
            userManager.create(newUser, (error, user) => {
                expect(error).to.not.exist;
                expect(user).to.exist;
                userManager.read('id_1', (error, fetchedUser) => {
                    expect(error).to.not.exist;
                    expect(fetchedUser).to.exist;
                    expect(fetchedUser).to.have.property('_id', 'id_1');
                    expect(fetchedUser).to.have.property('firstName', 'John');
                    done();
                });
            });
        });
    });

    describe('#update', () => {
        it('Should do nothing when user not exists', (done) => {
            let userToUpdate: User = new User('John', 'Doe', 'id1', 'mail1', 'base');
            userManager.update(userToUpdate, (error, user) => {
                expect(error).to.not.exist;
                expect(user).to.not.exist;
                done();
            });
        });

        it('Should update an existing user', (done) => {
            var newUser: User = new User('John', 'Doe', 'id_1', 'mail1', 'base1');
            userManager.create(newUser, (error, user) => {
                expect(error).to.not.exist;
                expect(user).to.exist;
                user.firstName = 'Ron';
                user.lastName = 'Borysovski';
                user.mail = 'mail2';

                userManager.update(user, (error, updatedUser) => {
                    console.log(error);
                    expect(error).to.not.exist;
                    expect(updatedUser).to.exist;
                    expect(updatedUser).to.have.property('firstName', 'Ron');
                    expect(updatedUser).to.have.property('lastName', 'Borysovski');
                    expect(updatedUser).to.have.property('mail', 'mail2');
                    done();
                })
            });
        });
    });

    describe('#delete', () => {
        it('Should do nothing when no user is found', (done) => {
            userManager.delete('id', (error, user) => {
                expect(error).to.not.exist;
                expect(user).to.not.exist;
                done();
            });
        });

        it('Should delete user', (done) => {
            var newUser: User = new User('John', 'Doe', 'id_1', 'mail1', 'base1');
            userManager.create(newUser, (error, user) => {
                expect(error).to.not.exist;
                expect(user).to.exist;

                userManager.delete(user._id, (error, user) => {
                    expect(error).to.not.exist;
                    expect(user).to.exist;

                    userManager.read('id_1', (error, user) => {
                        expect(error).to.not.exist;
                        expect(user).to.not.exist;

                        done();
                    });
                });
            });
        });
    });
});