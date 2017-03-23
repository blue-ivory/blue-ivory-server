import { UserManager } from './../server/managers/user.manager';
import { OrganizationManager } from './../server/managers/organization.manager';
import { PermissionManager } from './../server/managers/permission.manager';
import { User } from './../server/classes/user';
import { Permission } from './../server/classes/permission';
import { Organization } from './../server/classes/organization';
import { expect } from 'chai';

describe('UserManager', () => {
    let userManager: UserManager = new UserManager();
    let organizationManager: OrganizationManager = new OrganizationManager();
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

                user.firstName = 'Ron';
                user.lastName = 'Borysovski';
                user.mail = 'mail2';

                userManager.update(user).then((updatedUser) => {
                    expect(updatedUser).to.exist;
                    expect(updatedUser).to.have.property('firstName', 'Ron');
                    expect(updatedUser).to.have.property('lastName', 'Borysovski');
                    expect(updatedUser).to.have.property('mail', 'mail2');

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

        beforeEach((done: MochaDone) => {
            let userAPromise = userManager.create(new User('John', 'Test', 'unique@ID', 'mail1'));
            let userBPromise = userManager.create(new User('Jon', 'last', 'unique', 'mail2'));

            Promise.all([userAPromise, userBPromise]).then(() => {
                done();
            });
        });

        it('Should return 0 users when not found', done => {
            userManager.search('abcd').then(result => {
                expect(result).to.exist;
                expect(result).to.have.property('users');
                expect(result).to.have.property('totalCount', 0);
                expect(result.users).to.be.an('array');
                expect(result.users).to.have.length(0);

                done();
            });
        });

        it('Should return all users if empty search term', done => {
            userManager.search().then(result => {
                expect(result).to.exist;
                expect(result).to.have.property('users');
                expect(result).to.have.property('totalCount', 2);
                expect(result.users).to.be.an('array');
                expect(result.users).to.have.length(2);

                done();
            });
        });

        it('Should find users by firstName, lastName or unique id (Single word)', done => {

            userManager.search('john').then(result => {
                expect(result).to.exist;
                expect(result).to.have.property('users');
                expect(result).to.have.property('totalCount', 1);
                expect(result.users).to.be.an('array');
                expect(result.users).to.have.length(1);
                expect(result.users[0]).to.have.property('firstName', 'John');


                userManager.search('joN').then(result => {
                    expect(result).to.exist;
                    expect(result).to.have.property('users');
                    expect(result).to.have.property('totalCount', 1);
                    expect(result.users).to.be.an('array');
                    expect(result.users).to.have.length(1);
                    expect(result.users[0]).to.have.property('firstName', 'Jon');

                    userManager.search('jO').then(result => {
                        expect(result).to.exist;
                        expect(result).to.have.property('users');
                        expect(result).to.have.property('totalCount', 2);
                        expect(result.users).to.be.an('array');
                        expect(result.users).to.have.length(2);

                        userManager.search('ES').then(result => {
                            expect(result).to.exist;
                            expect(result).to.have.property('users');
                            expect(result).to.have.property('totalCount', 1);
                            expect(result.users).to.be.an('array');
                            expect(result.users).to.have.length(1);
                            expect(result.users[0]).to.have.property('lastName', 'Test');

                            userManager.search('st').then(result => {
                                expect(result).to.exist;
                                expect(result).to.have.property('users');
                                expect(result).to.have.property('totalCount', 2);
                                expect(result.users).to.be.an('array');
                                expect(result.users).to.have.length(2);

                                userManager.search('@').then(result => {
                                    expect(result).to.exist;
                                    expect(result).to.have.property('users');
                                    expect(result).to.have.property('totalCount', 1);
                                    expect(result.users).to.be.an('array');
                                    expect(result.users).to.have.length(1);
                                    expect(result.users[0]).to.have.property('_id', 'unique@ID');

                                    userManager.search('unique').then(result => {
                                        expect(result).to.exist;
                                        expect(result).to.have.property('users');
                                        expect(result).to.have.property('totalCount', 2);
                                        expect(result.users).to.be.an('array');
                                        expect(result.users).to.have.length(2);

                                        done();
                                    });
                                });
                            });
                        });
                    });
                });

            });
        });

        it('Should find users either by firstName or by lastName (two words)', done => {

            userManager.search('john te').then(result => {
                expect(result).to.exist;
                expect(result).to.have.property('users');
                expect(result).to.have.property('totalCount', 1);
                expect(result.users).to.be.an('array');
                expect(result.users).to.have.length(1);
                expect(result.users[0]).to.have.property('_id', 'unique@ID');

                userManager.search('las on').then(result => {
                    expect(result).to.exist;
                    expect(result).to.have.property('users');
                    expect(result).to.have.property('totalCount', 1);
                    expect(result.users).to.be.an('array');
                    expect(result.users).to.have.length(1);
                    expect(result.users[0]).to.have.property('_id', 'unique');

                    userManager.search('jo st').then(result => {
                        expect(result).to.exist;
                        expect(result).to.have.property('users');
                        expect(result).to.have.property('totalCount', 2);
                        expect(result.users).to.be.an('array');
                        expect(result.users).to.have.length(2);

                        done();
                    });
                });
            });
        });
    });

    describe('#setOrganization', () => {
        it('Should do nothing when user not exists', done => {
            let user: User = new User('fName', 'lName', 'uid', 'mail');

            organizationManager.create(new Organization('organization')).then(organization => {
                expect(organization).to.exist;

                userManager.setOrganization(user._id, organization._id).then(user => {
                    expect(user).to.not.exist;
                    done();
                });
            });
        });
        it('Should throw an error when organization not exists', done => {
            let user: User = new User('fName', 'lName', 'uid', 'mail');
            userManager.create(user).then(user => {
                expect(user).to.exist;

                userManager.setOrganization(user._id, '000000000000000000000000').catch(err => {
                    expect(err).to.exist;
                    expect(err).to.eql('Organization not found');
                    done();
                })
            });
        });
        it('Should set user\'s organization', done => {
            let user: User = new User('fName', 'lName', 'uid', 'mail');
            userManager.create(user).then(user => {
                expect(user).to.exist;
                organizationManager.create(new Organization('organization')).then(organization => {
                    expect(organization).to.exist;

                    userManager.setOrganization(user._id, organization._id).then(user => {
                        expect(user).to.exist;
                        expect(user).to.have.property('organization');
                        expect(user.organization).to.have.property('name', 'organization');

                        done();
                    });
                });
            });
        });
    });
});