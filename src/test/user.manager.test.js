"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_manager_1 = require("./../server/managers/user.manager");
const organization_manager_1 = require("./../server/managers/organization.manager");
const permission_manager_1 = require("./../server/managers/permission.manager");
const user_1 = require("./../server/classes/user");
const organization_1 = require("./../server/classes/organization");
const chai_1 = require("chai");
describe('UserManager', () => {
    let userManager = new user_manager_1.UserManager();
    let organizationManager = new organization_manager_1.OrganizationManager();
    let permissionManager = new permission_manager_1.PermissionManager();
    describe('#create', () => {
        it('Should create a user', (done) => {
            let newUser = new user_1.User('John', 'Doe', 'id_1', 'mail1');
            userManager.create(newUser).then((user) => {
                chai_1.expect(user).to.exist;
                chai_1.expect(user).to.have.property('firstName', 'John');
                chai_1.expect(user).to.have.property('lastName', 'Doe');
                chai_1.expect(user).to.have.property('_id', 'id_1');
                chai_1.expect(user).to.have.property('mail', 'mail1');
                chai_1.expect(user.permissions).to.exist;
                chai_1.expect(user.permissions.length).to.equal(0);
                done();
            });
        });
        it('Should throw an error when same ID or mail is given', (done) => {
            let newUser1 = new user_1.User('John', 'Doe', 'id_1', 'mail1');
            userManager.create(newUser1).then((user) => {
                chai_1.expect(user).to.exist;
                let newUser2 = new user_1.User('Test', 'Doe', 'id_1', 'mail1');
                userManager.create(newUser2).catch((error) => {
                    chai_1.expect(error).to.exist;
                    chai_1.expect(error).to.have.property('code', 11000);
                    done();
                });
            });
        });
    });
    describe('#all', () => {
        it('Should fetch 0 users when db is empty', (done) => {
            userManager.all().then((users) => {
                chai_1.expect(users).to.be.empty;
                done();
            });
        });
        it('Should fetch all users from db', (done) => {
            let temp = 0;
            for (let i = 0; i < 5; i++) {
                let newUser = new user_1.User('John', 'Doe', 'id_' + i, 'mail' + i);
                userManager.create(newUser).then((user) => {
                    temp++;
                    if (temp == 4) {
                        userManager.all().then((users) => {
                            chai_1.expect(users.length).to.equal(5);
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
                chai_1.expect(user).to.not.exist;
                done();
            });
        });
        it('Should return the user (if exists)', (done) => {
            let newUser = new user_1.User('John', 'Doe', 'id_1', 'mail1');
            userManager.create(newUser).then((user) => {
                chai_1.expect(user).to.exist;
                userManager.read('id_1').then((fetchedUser) => {
                    chai_1.expect(fetchedUser).to.exist;
                    chai_1.expect(fetchedUser).to.have.property('_id', 'id_1');
                    chai_1.expect(fetchedUser).to.have.property('firstName', 'John');
                    done();
                });
            });
        });
    });
    describe('#update', () => {
        it('Should do nothing when user not exists', (done) => {
            let userToUpdate = new user_1.User('John', 'Doe', 'id1', 'mail1');
            userManager.update(userToUpdate).then((user) => {
                chai_1.expect(user).to.not.exist;
                done();
            });
        });
        it('Should update an existing user', (done) => {
            let newUser = new user_1.User('John', 'Doe', 'id_1', 'mail1');
            userManager.create(newUser).then((user) => {
                chai_1.expect(user).to.exist;
                user.firstName = 'Ron';
                user.lastName = 'Borysovski';
                user.mail = 'mail2';
                userManager.update(user).then((updatedUser) => {
                    chai_1.expect(updatedUser).to.exist;
                    chai_1.expect(updatedUser).to.have.property('firstName', 'Ron');
                    chai_1.expect(updatedUser).to.have.property('lastName', 'Borysovski');
                    chai_1.expect(updatedUser).to.have.property('mail', 'mail2');
                    done();
                });
            });
        });
    });
    describe('#delete', () => {
        it('Should do nothing when no user is found', (done) => {
            userManager.delete('id').then((user) => {
                chai_1.expect(user).to.not.exist;
                done();
            });
        });
        it('Should delete user', (done) => {
            let newUser = new user_1.User('John', 'Doe', 'id_1', 'mail1');
            userManager.create(newUser).then((user) => {
                chai_1.expect(user).to.exist;
                userManager.delete(user._id).then((user) => {
                    chai_1.expect(user).to.exist;
                    userManager.read('id_1').then((user) => {
                        chai_1.expect(user).to.not.exist;
                        done();
                    });
                });
            });
        });
    });
    describe('#search', () => {
        beforeEach((done) => {
            let userAPromise = userManager.create(new user_1.User('John', 'Test', 'unique@ID', 'mail1'));
            let userBPromise = userManager.create(new user_1.User('Jon', 'last', 'unique', 'mail2'));
            Promise.all([userAPromise, userBPromise]).then(() => {
                done();
            });
        });
        it('Should return 0 users when not found', done => {
            userManager.search('abcd').then(result => {
                chai_1.expect(result).to.exist;
                chai_1.expect(result).to.have.property('users');
                chai_1.expect(result).to.have.property('totalCount', 0);
                chai_1.expect(result.users).to.be.an('array');
                chai_1.expect(result.users).to.have.length(0);
                done();
            });
        });
        it('Should return all users if empty search term', done => {
            userManager.search().then(result => {
                chai_1.expect(result).to.exist;
                chai_1.expect(result).to.have.property('users');
                chai_1.expect(result).to.have.property('totalCount', 2);
                chai_1.expect(result.users).to.be.an('array');
                chai_1.expect(result.users).to.have.length(2);
                done();
            });
        });
        it('Should find users by firstName, lastName or unique id (Single word)', done => {
            userManager.search('john').then(result => {
                chai_1.expect(result).to.exist;
                chai_1.expect(result).to.have.property('users');
                chai_1.expect(result).to.have.property('totalCount', 1);
                chai_1.expect(result.users).to.be.an('array');
                chai_1.expect(result.users).to.have.length(1);
                chai_1.expect(result.users[0]).to.have.property('firstName', 'John');
                userManager.search('joN').then(result => {
                    chai_1.expect(result).to.exist;
                    chai_1.expect(result).to.have.property('users');
                    chai_1.expect(result).to.have.property('totalCount', 1);
                    chai_1.expect(result.users).to.be.an('array');
                    chai_1.expect(result.users).to.have.length(1);
                    chai_1.expect(result.users[0]).to.have.property('firstName', 'Jon');
                    userManager.search('jO').then(result => {
                        chai_1.expect(result).to.exist;
                        chai_1.expect(result).to.have.property('users');
                        chai_1.expect(result).to.have.property('totalCount', 2);
                        chai_1.expect(result.users).to.be.an('array');
                        chai_1.expect(result.users).to.have.length(2);
                        userManager.search('ES').then(result => {
                            chai_1.expect(result).to.exist;
                            chai_1.expect(result).to.have.property('users');
                            chai_1.expect(result).to.have.property('totalCount', 1);
                            chai_1.expect(result.users).to.be.an('array');
                            chai_1.expect(result.users).to.have.length(1);
                            chai_1.expect(result.users[0]).to.have.property('lastName', 'Test');
                            userManager.search('st').then(result => {
                                chai_1.expect(result).to.exist;
                                chai_1.expect(result).to.have.property('users');
                                chai_1.expect(result).to.have.property('totalCount', 2);
                                chai_1.expect(result.users).to.be.an('array');
                                chai_1.expect(result.users).to.have.length(2);
                                userManager.search('@').then(result => {
                                    chai_1.expect(result).to.exist;
                                    chai_1.expect(result).to.have.property('users');
                                    chai_1.expect(result).to.have.property('totalCount', 1);
                                    chai_1.expect(result.users).to.be.an('array');
                                    chai_1.expect(result.users).to.have.length(1);
                                    chai_1.expect(result.users[0]).to.have.property('_id', 'unique@ID');
                                    userManager.search('unique').then(result => {
                                        chai_1.expect(result).to.exist;
                                        chai_1.expect(result).to.have.property('users');
                                        chai_1.expect(result).to.have.property('totalCount', 2);
                                        chai_1.expect(result.users).to.be.an('array');
                                        chai_1.expect(result.users).to.have.length(2);
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
                chai_1.expect(result).to.exist;
                chai_1.expect(result).to.have.property('users');
                chai_1.expect(result).to.have.property('totalCount', 1);
                chai_1.expect(result.users).to.be.an('array');
                chai_1.expect(result.users).to.have.length(1);
                chai_1.expect(result.users[0]).to.have.property('_id', 'unique@ID');
                userManager.search('las on').then(result => {
                    chai_1.expect(result).to.exist;
                    chai_1.expect(result).to.have.property('users');
                    chai_1.expect(result).to.have.property('totalCount', 1);
                    chai_1.expect(result.users).to.be.an('array');
                    chai_1.expect(result.users).to.have.length(1);
                    chai_1.expect(result.users[0]).to.have.property('_id', 'unique');
                    userManager.search('jo st').then(result => {
                        chai_1.expect(result).to.exist;
                        chai_1.expect(result).to.have.property('users');
                        chai_1.expect(result).to.have.property('totalCount', 2);
                        chai_1.expect(result.users).to.be.an('array');
                        chai_1.expect(result.users).to.have.length(2);
                        done();
                    });
                });
            });
        });
    });
    describe('#setOrganization', () => {
        it('Should do nothing when user not exists', done => {
            let user = new user_1.User('fName', 'lName', 'uid', 'mail');
            organizationManager.create(new organization_1.Organization('organization')).then(organization => {
                chai_1.expect(organization).to.exist;
                userManager.setOrganization(user._id, organization._id).then(user => {
                    chai_1.expect(user).to.not.exist;
                    done();
                });
            });
        });
        it('Should throw an error when organization not exists', done => {
            let user = new user_1.User('fName', 'lName', 'uid', 'mail');
            userManager.create(user).then(user => {
                chai_1.expect(user).to.exist;
                userManager.setOrganization(user._id, '000000000000000000000000').catch(err => {
                    chai_1.expect(err).to.exist;
                    chai_1.expect(err).to.eql('Organization not found');
                    done();
                });
            });
        });
        it('Should set user\'s organization', done => {
            let user = new user_1.User('fName', 'lName', 'uid', 'mail');
            userManager.create(user).then(user => {
                chai_1.expect(user).to.exist;
                organizationManager.create(new organization_1.Organization('organization')).then(organization => {
                    chai_1.expect(organization).to.exist;
                    userManager.setOrganization(user._id, organization._id).then(user => {
                        chai_1.expect(user).to.exist;
                        chai_1.expect(user).to.have.property('organization');
                        chai_1.expect(user.organization).to.have.property('name', 'organization');
                        done();
                    });
                });
            });
        });
    });
});
