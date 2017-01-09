/// <reference path="../../typings/index.d.ts" />
import { UserManager } from './../server/managers/user.manager';
import { BaseManager } from './../server/managers/base.manager';
import { PermissionManager } from './../server/managers/permission.manager';
import { User } from './../server/classes/user';
import { Permission } from './../server/classes/permission';
import { Base } from './../server/classes/base';
import { expect } from 'chai';

describe('UserManager', () => {
    let userManager: UserManager = new UserManager();
    let baseManager: BaseManager = new BaseManager();
    let permissionManager: PermissionManager = new PermissionManager();

    describe('#create', () => {
        it('Should create a user', (done) => {
            let newUser: User = new User('John', 'Doe', 'id_1', 'mail1');
            userManager.create(newUser).then((user) => {
                expect(user).to.exist;
                expect(user).to.have.property('firstName', 'John');
                expect(user).to.have.property('lastName', 'Doe');
                expect(user).to.have.property('_id', 'id_1');
                expect(user).to.have.property('mail', 'mail1');
                expect(user.permissions).to.exist;
                expect(user.permissions.length).to.equal(0);
                done();
            });
        });

        it('Should throw an error when same ID or mail is given', (done) => {
            let newUser1: User = new User('John', 'Doe', 'id_1', 'mail1');
            userManager.create(newUser1).then((user) => {
                expect(user).to.exist;
                let newUser2: User = new User('Test', 'Doe', 'id_1', 'mail1');
                userManager.create(newUser2).catch((error) => {
                    expect(error).to.exist;
                    expect(error).to.have.property('code', 11000);
                    done();
                })
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
                let newUser: User = new User('John', 'Doe', 'id_' + i, 'mail' + i);
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
            let newUser: User = new User('John', 'Doe', 'id_1', 'mail1');
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
            let userToUpdate: User = new User('John', 'Doe', 'id1', 'mail1');
            userManager.update(userToUpdate).then((user) => {
                expect(user).to.not.exist;
                done();
            });
        });

        it('Should update an existing user', (done) => {
            let newUser: User = new User('John', 'Doe', 'id_1', 'mail1');
            userManager.create(newUser).then((user) => {
                expect(user).to.exist;

                baseManager.create(new Base('test')).then(base => {
                    expect(base).to.exist;

                    user.firstName = 'Ron';
                    user.lastName = 'Borysovski';
                    user.mail = 'mail2';
                    user.base = base;
                    user.permissions = [Permission.ADMIN];

                    userManager.update(user).then((updatedUser) => {
                        expect(updatedUser).to.exist;
                        expect(updatedUser).to.have.property('firstName', 'Ron');
                        expect(updatedUser).to.have.property('lastName', 'Borysovski');
                        expect(updatedUser).to.have.property('mail', 'mail2');
                        expect(updatedUser).to.have.property('base');
                        expect(updatedUser.base).to.have.property('name', 'test');
                        expect(updatedUser.permissions).to.exist;
                        expect(updatedUser.permissions.length).to.equal(1);
                        expect(updatedUser.permissions).to.have.members([Permission.ADMIN]);
                        done();
                    });
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
            let newUser: User = new User('John', 'Doe', 'id_1', 'mail1');
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

    describe('#search', () => {
        it('Should return 0 users when not found', done => {
            userManager.search('test').then(users => {
                expect(users).to.exist;
                expect(users).to.be.an('array');
                expect(users.length).to.eq(0);
                done();
            });
        });

        it('Should return all users if empty search term', done => {
            userManager.create(new User('John', 'Test', 'unique@ID', 'mail1')).then(() => {
                userManager.create(new User('Jon', 'last', 'unique', 'mail2')).then(() => {
                    userManager.search().then(users => {
                        expect(users).to.exist;
                        expect(users).to.be.an('array');
                        expect(users.length).to.eq(2);

                        done();
                    });
                });
            });
        });

        it('Should find users by firstName, lastName or unique id (Single word)', done => {
            userManager.create(new User('John', 'Test', 'unique@ID', 'mail1')).then(() => {
                userManager.create(new User('Jon', 'last', 'unique', 'mail2')).then(() => {
                    userManager.search('john').then(users => {
                        expect(users).to.exist;
                        expect(users).to.be.an('array');
                        expect(users.length).to.eq(1);
                        expect(users[0]).to.have.property('firstName', 'John');

                        userManager.search('joN').then(users => {
                            expect(users).to.exist;
                            expect(users).to.be.an('array');
                            expect(users.length).to.eq(1);
                            expect(users[0]).to.have.property('firstName', 'Jon');

                            userManager.search('jO').then(users => {
                                expect(users).to.exist;
                                expect(users).to.be.an('array');
                                expect(users.length).to.eq(2);

                                userManager.search('ES').then(users => {
                                    expect(users).to.exist;
                                    expect(users).to.be.an('array');
                                    expect(users.length).to.eq(1);
                                    expect(users[0]).to.have.property('lastName', 'Test');

                                    userManager.search('st').then(users => {
                                        expect(users).to.exist;
                                        expect(users).to.be.an('array');
                                        expect(users.length).to.eq(2);

                                        userManager.search('@').then(users => {
                                            expect(users).to.exist;
                                            expect(users).to.be.an('array');
                                            expect(users.length).to.eq(1);
                                            expect(users[0]).to.have.property('_id', 'unique@ID');

                                            userManager.search('unique').then(users => {
                                                expect(users).to.exist;
                                                expect(users).to.be.an('array');
                                                expect(users.length).to.eq(2);

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
        });

        it('Should find users either by firstName or by lastName (two words)', done => {
            userManager.create(new User('John', 'Test', 'unique@ID', 'mail1')).then(() => {
                userManager.create(new User('Jon', 'last', 'unique', 'mail2')).then(() => {
                    userManager.search('john te').then(users => {
                        expect(users).to.exist;
                        expect(users).to.be.an('array');
                        expect(users.length).to.eq(1);
                        expect(users[0]).to.have.property('_id', 'unique@ID');

                        userManager.search('las on').then(users => {
                            expect(users).to.exist;
                            expect(users).to.be.an('array');
                            expect(users.length).to.eq(1);
                            expect(users[0]).to.have.property('_id', 'unique');

                            userManager.search('jo st').then(users => {
                                expect(users).to.exist;
                                expect(users).to.be.an('array');
                                expect(users.length).to.eq(2);

                                done();
                            });
                        });
                    });
                });
            });
        });
    });

    describe('#setBase', () => {
        it('Should do nothing when user not exists', done => {
            let user: User = new User('fName', 'lName', 'uid', 'mail');

            baseManager.create(new Base('base')).then(base => {
                expect(base).to.exist;

                userManager.setBase(user._id, base).then(user => {
                    expect(user).to.not.exist;
                    done();
                });
            });
        });
        it('Should throw an error when base not exists', done => {
            let user: User = new User('fName', 'lName', 'uid', 'mail');
            userManager.create(user).then(user => {
                expect(user).to.exist;

                userManager.setBase(user._id, new Base('base')).catch(err => {
                    expect(err).to.exist;
                    expect(err).to.have.property('name', 'CastError');
                    expect(err).to.have.property('kind', 'ObjectId');
                    expect(err).to.have.property('path', 'base');
                    done();
                })
            });
        });
        it('Should set user\'s base', done => {
            let user: User = new User('fName', 'lName', 'uid', 'mail');
            userManager.create(user).then(user => {
                expect(user).to.exist;
                baseManager.create(new Base('base')).then(base => {
                    expect(base).to.exist;

                    userManager.setBase(user._id, base).then(user => {
                        expect(user).to.exist;
                        expect(user).to.have.property('base');
                        expect(user.base).to.have.property('name', 'base');

                        done();
                    });
                });
            });
        });
        it('Should remove user\'s permission when changing base', done => {
            let user: User = new User('fName', 'lName', 'uid', 'mail');
            userManager.create(user).then(user => {
                expect(user).to.exist;
                permissionManager.setPermissions(user._id, [Permission.APPROVE_CIVILIAN, Permission.APPROVE_CAR]).then(user => {
                    expect(user).to.exist;
                    expect(user).to.have.property('permissions');
                    expect(user.permissions).to.be.an('array');
                    expect(user.permissions).to.have.length(2);

                    baseManager.create(new Base('base')).then(base => {
                        expect(base).to.exist;

                        userManager.setBase(user._id, base).then(user => {
                            expect(user).to.exist;
                            expect(user).to.have.property('base');
                            expect(user.base).to.have.property('name', 'base');
                            expect(user).to.have.property('permissions');
                            expect(user.permissions).to.be.an('array');
                            expect(user.permissions).to.have.length(0);

                            done();
                        });
                    });
                });
            });
        });
    });
});