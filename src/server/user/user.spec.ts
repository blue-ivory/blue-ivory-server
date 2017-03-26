import * as mongoose from 'mongoose';
import { expect } from 'chai';
import { ICollection } from '../helpers/collection';
import { IUser } from "./user.interface";
import { Organization } from "./../organization/organization.class";
import { User } from "./user.class";
import { IOrganization } from "../organization/organization.interface";

describe('User', () => {

    describe('#createUser', () => {
        it('Should create a user', done => {
            User.createUser('Ron', 'Borysovski', '123456', 'roni537@gmail.com').then((user: IUser) => {
                expect(user).to.exist;
                expect(user).to.have.property('firstName', 'Ron');
                expect(user).to.have.property('lastName', 'Borysovski');
                expect(user).to.have.property('_id', '123456');
                expect(user).to.have.property('mail', 'roni537@gmail.com');

                done();
            }).catch(err => {
                console.log(err);
                expect(err).to.not.exist;
            });
        });
        it('Should throw an error when not user is not valid', done => {
            User.createUser('Ron', null, null, null).catch(err => {
                expect(err).to.exist;

                done();
            });
        });
        it('Should throw an error when same ID or mail is given', done => {
            Promise.all([
                User.createUser('Ron', 'Borysovski', '123456', 'roni537@gmail.com'),
                User.createUser('John', 'Doe', '123456', 'mail@gmail.com')]).catch(error => {
                    expect(error).to.exist;
                    expect(error).to.have.property('code', 11000);

                    done();
                });
        });
    });

    describe('#findUser', () => {
        it('Should return null when user not found', done => {
            User.findUser('id').then((user: IUser) => {
                expect(user).to.not.exist;

                done();
            })
        });

        it('Should return user if exists', done => {
            User.createUser('Ron', 'Borysovski', '123456', 'roni537@gmail.com').then(() => {
                return User.findUser('123456');
            }).then((user: IUser) => {
                expect(user).to.exist;
                expect(user).to.have.property('firstName', 'Ron');

                done();
            });
        });
    });

    describe('#updateUser', () => {
        it('Should return null when user not exists', done => {
            let user = <IUser>{
                firstName: 'Ron',
                lastName: 'Borysovski',
                _id: '123456',
                mail: 'roni537@gmail.com'
            };

            User.updateUser(user).then((user: IUser) => {
                expect(user).to.not.exist;

                done();
            });
        });

        it('Should update a user', done => {
            User.createUser('Ron', 'Borysovski', '123456', 'roni537@gmail.com').then((user: IUser) => {
                expect(user).to.exist;
                expect(user).to.have.property('isAdmin', false);

                user.firstName = 'Admin';
                user.lastName = 'Administrator';
                user.isAdmin = true;

                return User.updateUser(user);
            }).then((user: IUser) => {
                expect(user).to.exist;
                expect(user).to.have.property('isAdmin', true);
                expect(user).to.have.property('firstName', 'Admin');
                expect(user).to.have.property('lastName', 'Administrator');

                done();
            });
        });

        it('Should throw an error when _id not exists', done => {
            let user = <IUser>{
                firstName: 'Ron'
            };

            User.updateUser(user).catch(err => {
                expect(err).to.exist;
                expect(err).to.have.property('name', 'CastError');
                expect(err).to.have.property('path', '_id');

                done();
            })
        });
    });

    describe('#searchUsers', () => {
        beforeEach(done => {
            Promise.all([
                User.createUser('Ron', 'Borysovski', '123456', 'roni537@gmail.com'),
                User.createUser('John', 'Doe', '789000', 'address@yahoo.com')
            ]).then(() => {
                done();
            });
        });

        it('Should return 0 users when not found', done => {
            User.searchUsers('test').then((collection: ICollection<IUser>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 0);
                expect(collection).to.have.property('set').that.satisfies((set: IUser[]) => {
                    expect(set).to.exist;
                    expect(set).to.be.an('array');
                    expect(set).to.have.length(0);

                    return true;
                });

                done();
            })
        });

        it('Should return all users when searchTerm is empty', done => {
            User.searchUsers().then((collection: ICollection<IUser>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 2);
                expect(collection).to.have.property('set').that.satisfies((set: IUser[]) => {
                    expect(set).to.exist;
                    expect(set).to.be.an('array');
                    expect(set).to.have.length(2);

                    return true;
                });

                done();
            });
        });

        it('Should find users by firstName, lastName or unique id (single word)', done => {
            User.searchUsers('ron').then((collection: ICollection<IUser>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 1);

                return User.searchUsers('ohn');
            }).then((collection: ICollection<IUser>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 1);

                return User.searchUsers('rySovS');
            }).then((collection: ICollection<IUser>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 1);

                return User.searchUsers('OE');
            }).then((collection: ICollection<IUser>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 1);

                return User.searchUsers('o');
            }).then((collection: ICollection<IUser>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 2);

                return User.searchUsers('45');
            }).then((collection: ICollection<IUser>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 1);

                done();
            });
        });

        it('Should find users either by firstName or by lastName (two words)', done => {
            User.searchUsers('ron ory').then((collection: ICollection<IUser>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 1);

                return User.searchUsers('ohn e');
            }).then((collection: ICollection<IUser>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 1);

                return User.searchUsers('borysovski ON');
            }).then((collection: ICollection<IUser>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 1);

                return User.searchUsers('Sovski ON');
            }).then((collection: ICollection<IUser>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 1);

                return User.searchUsers('oe Jo');
            }).then((collection: ICollection<IUser>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 1);

                return User.searchUsers('o o')
            }).then((collection: ICollection<IUser>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 2);

                done();
            });
        });
    });

    describe('#setOrganization', () => {

        let organization: IOrganization;
        let user: IUser;

        beforeEach(done => {
            Organization.createOrganization('organization').then((org: IOrganization) => {
                expect(org).to.exist;
                organization = org;

                return User.createUser('Ron', 'Borysovski', '123456', 'roni537@gmail.com');
            }).then((u: IUser) => {
                expect(u).to.exist;
                user = u;

                done();
            });
        });

        it('Should do nothing when user not exists', done => {
            User.setOrganization('unique@id', null).then((user: IUser) => {
                expect(user).to.not.exist;

                done();
            });
        });

        it('Should remove user\'s organization if organization not exists', done => {
            User.setOrganization(user._id, null).then((user: IUser) => {
                expect(user).to.exist;
                expect(user).to.have.property('organization', null);
                done();
            });
        });

        it('Should set user\'s organization', done => {
            User.setOrganization(user._id, organization._id).then((user: IUser) => {
                expect(user).to.exist;
                expect(user).to.have.property('organization').that.satisfies((organization: IOrganization) => {
                    expect(organization).to.exist;
                    expect(organization).to.have.property('name', 'organization');

                    return true;
                });

                done();
            });
        })
    });
});