/// <reference path="../../typings/index.d.ts" />
import { UserManager } from './../server/managers/user.manager';
import { User } from './../server/classes/user';
import { expect } from 'chai';

describe('UserManager', () => {
    let userManager: UserManager = new UserManager();

    describe('#create', () => {
        it('Should create a user', (done) => {
            let newUser: User = new User('John', 'Doe', 'id_1', 'mail1', 'base1');
            userManager.create(newUser).then((user) => {
                expect(user).to.exist;
                expect(user).to.have.property('firstName', 'John');
                expect(user).to.have.property('lastName', 'Doe');
                expect(user).to.have.property('_id', 'id_1');
                expect(user).to.have.property('mail', 'mail1');
                expect(user).to.have.property('base', 'base1');
                expect(user.roles).to.exist;
                expect(user.roles.length).to.equal(1);
                expect(user.roles[0]).to.equal('user');
                done();
            });
        });

        it('Should throw an error when same ID or mail is given', (done) => {
            let newUser1: User = new User('John', 'Doe', 'id_1', 'mail1', 'base1');
            userManager.create(newUser1).then((user) => {
                expect(user).to.exist;
                let newUser2: User = new User('Test', 'Doe', 'id_1', 'mail1', 'base1');
                userManager.create(newUser2).catch((error) => {
                    expect(error).to.exist;
                    expect(error).to.have.property('code', 11000);
                    done();
                })
            });
        });

        it('Should not create user with wierd roles', (done) => {
            let newUser: User = new User('Ron', 'Borysovski', 'uid', 'mail', 'base', ['admin', 'champ']);
            userManager.create(newUser).catch((error) => {
                expect(error).to.exist;
                done();
            })
        });

        it('Should create user with specified roles', (done) => {
            let newUser: User = new User('Ron', 'Borysovski', 'uid', 'mail', 'base', ['admin', 'approve-car']);
            userManager.create(newUser).then((user) => {
                expect(user).to.exist;
                expect(user.roles).to.exist;
                expect(user.roles.length).to.equal(2);
                expect(user.roles).to.have.members(['admin', 'approve-car']);
                done();
            });
        });
    });


    describe('#all', () => {
        it('Should fetch 0 users when db is empty', (done) => {
            userManager.all().then((users) => {
                expect(users).to.be.empty;
                done();
            });
        });

        it('Should fetch all users from db', (done) => {
            let temp: number = 0;
            for (let i = 0; i < 5; i++) {
                let newUser: User = new User('John', 'Doe', 'id_' + i, 'mail' + i, 'base' + i);
                userManager.create(newUser).then((user) => {
                    temp++;

                    if (temp == 4) {
                        userManager.all().then((users) => {
                            expect(users.length).to.equal(5);
                            done();
                        });
                    }
                });
            }
        });
    });

    describe('#read', () => {
        it('Should not return user (if not exists)', (done) => {
            userManager.read("id").then((user) => {
                expect(user).to.not.exist;
                done();
            });
        });

        it('Should return the user (if exists)', (done) => {
            let newUser: User = new User('John', 'Doe', 'id_1', 'mail1', 'base1');
            userManager.create(newUser).then((user) => {
                expect(user).to.exist;
                userManager.read('id_1').then((fetchedUser) => {
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
            userManager.update(userToUpdate).then((user) => {
                expect(user).to.not.exist;
                done();
            });
        });

        it('Should update an existing user', (done) => {
            let newUser: User = new User('John', 'Doe', 'id_1', 'mail1', 'base1');
            userManager.create(newUser).then((user) => {
                expect(user).to.exist;
                user.firstName = 'Ron';
                user.lastName = 'Borysovski';
                user.mail = 'mail2';
                user.roles = ['admin'];

                userManager.update(user).then((updatedUser) => {
                    expect(updatedUser).to.exist;
                    expect(updatedUser).to.have.property('firstName', 'Ron');
                    expect(updatedUser).to.have.property('lastName', 'Borysovski');
                    expect(updatedUser).to.have.property('mail', 'mail2');
                    expect(updatedUser.roles).to.exist;
                    expect(updatedUser.roles.length).to.equal(1);
                    expect(updatedUser.roles).to.have.members(['admin']);
                    done();
                });
            });

        });
    });

    describe('#delete', () => {
        it('Should do nothing when no user is found', (done) => {
            userManager.delete('id').then((user) => {
                expect(user).to.not.exist;
                done();
            });
        });

        it('Should delete user', (done) => {
            let newUser: User = new User('John', 'Doe', 'id_1', 'mail1', 'base1');
            userManager.create(newUser).then((user) => {
                expect(user).to.exist;
                userManager.delete(user._id).then((user) => {
                    expect(user).to.exist;
                    userManager.read('id_1').then((user) => {
                        expect(user).to.not.exist;
                        done();
                    });
                });
            });
        });
    });
});