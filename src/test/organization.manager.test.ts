/// <reference path="../../typings/index.d.ts" />
import { OrganizationManager } from './../server/managers/organization.manager';
import { UserManager } from './../server/managers/user.manager';
import { Organization } from './../server/classes/organization';
import { User } from './../server/classes/user';
import { expect } from 'chai';

describe('OrganizationManager', () => {

    let organizationManager: OrganizationManager = new OrganizationManager();
    let userManager: UserManager = new UserManager();

    describe('#create', () => {
        it('Should throw an error when invalid data', done => {
            organizationManager.create(new Organization('')).catch(error => {
                expect(error).to.exist;
                expect(error).to.have.property('errors');
                expect(error.errors).to.have.property('name');
                expect(error.errors.name).to.have.property('kind', 'required');

                done();
            })
        });
        it('Should create organization', done => {
            organizationManager.create(new Organization('organization')).then(organization => {
                expect(organization).to.exist;
                expect(organization).to.have.property('_id');
                expect(organization).to.have.property('name', 'organization');

                done();
            });
        });
        it('Should throw an error when organization with same name exists', done => {
            organizationManager.create(new Organization('organization')).then(organization => {
                expect(organization).to.exist;
                organizationManager.create(new Organization('organization')).catch(error => {
                    expect(error).to.exist;
                    expect(error).to.have.property('code', 11000);

                    done();
                });
            });
        });
    });

    describe('#all', () => {
        it('Should return nothing when db is empty', done => {
            organizationManager.all().then(organizations => {
                expect(organizations).to.exist;
                expect(organizations).to.be.an('array');
                expect(organizations).to.have.length(0);

                done();
            });
        });

        it('Should return all organizations from db', done => {
            organizationManager.create(new Organization('organization')).then(() => {
                organizationManager.create(new Organization('organization2')).then(() => {
                    organizationManager.create(new Organization('organization3')).then(() => {
                        organizationManager.all().then(organizations => {
                            expect(organizations).to.exist;
                            expect(organizations).to.be.an('array');
                            expect(organizations).to.have.length(3);

                            done();
                        });
                    });
                });
            });
        });
    });

    describe('#read', () => {
        it('Should return nothing when id not found', done => {
            // HEX value with length of 24 represents mongoose.Schema.Types.ObjectId
            organizationManager.read('000000000000000000000000').then(organization => {
                expect(organization).to.not.exist;
                done();
            });
        });
        it('Should return organization by id', done => {
            organizationManager.create(new Organization('bName')).then(organization => {
                expect(organization).to.exist;

                organizationManager.read(organization._id).then(foundOrganization => {
                    expect(foundOrganization).to.exist;
                    expect(foundOrganization).to.have.property('name', 'bName');

                    done();
                });
            });
        });
    });

    describe('#update', () => {
        it('Should do nothing when organization not exists', done => {
            let organization: Organization = new Organization('name');
            organization._id = '000000000000000000000000';
            organizationManager.update(organization).then(organization => {
                expect(organization).to.not.exist;
                done();
            });
        });
        it('Should throw an error when duplicated name found', done => {
            organizationManager.create(new Organization('bName')).then(() => {
                organizationManager.create(new Organization('bName2')).then(organization => {
                    expect(organization).to.exist;
                    organization.name = 'bName';
                    organizationManager.update(organization).catch(error => {
                        expect(error).to.exist;
                        expect(error).to.have.property('code', 11000);

                        done();
                    });
                });
            });
        });
        it('Should update organization', done => {
            organizationManager.create(new Organization('name')).then(organization => {
                expect(organization).to.exist;
                organization.name = 'bName';
                organizationManager.update(organization).then(updatedOrganization => {
                    expect(updatedOrganization).to.exist;
                    expect(updatedOrganization).to.have.property('name', 'bName');

                    done();
                });
            });
        });
    });

    describe('#delete', () => {
        it('Should do nothing when organization not found', done => {
            organizationManager.delete('000000000000000000000000').then(organization => {
                expect(organization).to.not.exist;

                done();
            });
        });
        it('Should delete the organization', done => {
            organizationManager.create(new Organization('name')).then(organization => {
                expect(organization).to.exist;

                organizationManager.delete(organization._id).then(deletedOrganization => {
                    expect(deletedOrganization).to.exist;

                    organizationManager.read(organization._id).then(organization => {
                        expect(organization).to.not.exist;

                        done();
                    });
                });
            });
        });
    });

    describe('#search', () => {
        it('Should return all organizations when no searchTerm provided', done => {
            organizationManager.create(new Organization('name1')).then(() => {
                organizationManager.create(new Organization('name2')).then(() => {
                    organizationManager.create(new Organization('name3')).then(() => {
                        organizationManager.search('').then(organizations => {
                            expect(organizations).to.exist;
                            expect(organizations).to.be.an('array');
                            expect(organizations).to.have.length(3);

                            done();
                        });
                    });
                });
            });
        });
        it('Should return nothing when searchTerm don\'t match any name', done => {
            organizationManager.create(new Organization('name1')).then(() => {
                organizationManager.create(new Organization('name2')).then(() => {
                    organizationManager.create(new Organization('name3')).then(() => {
                        organizationManager.search('test').then(organizations => {
                            expect(organizations).to.exist;
                            expect(organizations).to.be.an('array');
                            expect(organizations).to.have.length(0);

                            done();
                        });
                    });
                });
            });
        });
        it('Should return organizations filtered by searchTerm', done => {
            organizationManager.create(new Organization('test')).then(() => {
                organizationManager.create(new Organization('rtst')).then(() => {
                    organizationManager.create(new Organization('ees21s')).then(() => {
                        organizationManager.search('st').then(organizations => {
                            expect(organizations).to.exist;
                            expect(organizations).to.be.an('array');
                            expect(organizations).to.have.length(2);

                            organizationManager.search('21').then(organizations => {
                                expect(organizations).to.exist;
                                expect(organizations).to.be.an('array');
                                expect(organizations).to.have.length(1);

                                organizationManager.search('es').then(organizations => {
                                    expect(organizations).to.exist;
                                    expect(organizations).to.be.an('array');
                                    expect(organizations).to.have.length(2);

                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });

        it('Should return organization with amount of users', done => {
            organizationManager.create(new Organization('Dolphin')).then((organization1: Organization) => {
                organizationManager.create(new Organization('Misha')).then((organization2: Organization) => {
                    userManager.create(new User('12', '22', 'id1', '42')).then(() => {
                        userManager.create(new User('1', '2', 'id2', '4')).then(() => {
                            userManager.setOrganization('id1', organization1).then(() => {
                                userManager.setOrganization('id2', organization1).then(() => {
                                    organizationManager.search('dol').then(organizations => {
                                        expect(organizations).to.exist;
                                        expect(organizations).to.be.an('array');
                                        expect(organizations).to.have.length(1);
                                        expect(organizations[0]).to.have.property('name', 'Dolphin');
                                        expect(organizations[0]).to.have.property('users');
                                        expect(organizations[0].users).to.eql(2);
                                        expect(organizations[0]).to.have.property('requests');
                                        expect(organizations[0].requests).to.eql(0);                                        

                                        done();
                                    })
                                });
                            });
                        });
                    });
                });
            });
        });
    })
});