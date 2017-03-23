import { OrganizationManager } from './../server/managers/organization.manager';
import { UserManager } from './../server/managers/user.manager';
import { Organization } from './../server/classes/organization';
import { User } from './../server/classes/user';
import { Task, TaskType } from './../server/classes/task';
import { expect } from 'chai';
import * as mongoose from 'mongoose';
import Types = mongoose.Types;

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
            organization._id = new Types.ObjectId();
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
        beforeEach((done: MochaDone) => {
            Promise.all([
                organizationManager.create(new Organization('org one')),
                organizationManager.create(new Organization('org two')),
                organizationManager.create(new Organization('org three')),
                organizationManager.create(new Organization('org four'))
            ]).then((values: Organization[]) => {
                userManager.create(new User('t', 'e', 's', 't')).then(user => {
                    userManager.setOrganization('s', values[0]._id).then(() => done());
                });
            });
        });

        it('Should return all organizations when no searchTerm provided', done => {
            organizationManager.search('').then(result => {
                expect(result).to.exist;
                expect(result).to.have.property('totalCount', 4);
                expect(result).to.have.property('organizations');
                expect(result.organizations).to.be.an('array');
                expect(result.organizations).to.have.length(4);

                done();
            });
        });
        it('Should return nothing when searchTerm don\'t match any name', done => {
            organizationManager.search('test').then(result => {
                expect(result).to.exist;
                expect(result).to.have.property('totalCount', 0);
                expect(result).to.have.property('organizations');
                expect(result.organizations).to.be.an('array');
                expect(result.organizations).to.have.length(0);

                done();
            });
        });
        it('Should return organizations filtered by searchTerm', done => {

            Promise.all(['org', 'org ', 'o', 'r', 'g'].map(name => {
                return organizationManager.search(name);
            })).then(values => {
                values.forEach(value => {
                    expect(value).to.exist;
                    expect(value).to.have.property('totalCount', 4);
                    expect(value).to.have.property('organizations');
                    expect(value.organizations).to.be.an('array');
                    expect(value.organizations).to.have.length(4);
                });

                return Promise.all(['one', 'two', 'three', 'four', 'n', 'u', 'f'].map(name => {
                    return organizationManager.search(name);
                }))
            }).then(values => {
                values.forEach(value => {
                    expect(value).to.exist;
                    expect(value).to.have.property('totalCount', 1);
                    expect(value).to.have.property('organizations');
                    expect(value.organizations).to.be.an('array');
                    expect(value.organizations).to.have.length(1);
                });

                return Promise.all(['e', 't'].map(name => {
                    return organizationManager.search(name);
                }))
            }).then(values => {
                values.forEach(value => {
                    expect(value).to.exist;
                    expect(value).to.have.property('totalCount', 2);
                    expect(value).to.have.property('organizations');
                    expect(value.organizations).to.be.an('array');
                    expect(value.organizations).to.have.length(2);
                });

                done();
            });
        });

        it('Should return organization with amount of users', done => {

            organizationManager.search('').then(result => {
                expect(result).to.exist;
                expect(result).to.have.property('totalCount', 4);
                expect(result).to.have.property('organizations');
                expect(result.organizations).to.be.an('array');
                expect(result.organizations).to.have.length(4);
                expect(result.organizations).to.satisfy((organizations) => {
                    return organizations.some(organization => {
                        return organization.users === 1;
                    });
                });


                done();
            });
        });
    });

    describe('#setWorkflow', () => {
        let organization: Organization = null;
        let organization2: Organization = null;


        beforeEach(done => {
            organizationManager.create(new Organization('org')).then(org => {
                expect(org).to.exist;
                expect(org).to.have.property('workflow').that.satisfies(value => {
                    expect(value).to.be.an('array');
                    expect(value).to.have.length(0);
                    return true;
                });

                organization = org;

                return organizationManager.create(new Organization('org2'));
            }).then(org2 => {
                expect(org2).to.exist;
                expect(org2).to.have.property('workflow').that.satisfies(value => {
                    expect(value).to.be.an('array');
                    expect(value).to.have.length(0);
                    return true;
                });

                organization2 = org2;
                done();
            });
        });

        it('Should throw error when organization not found', done => {
            organizationManager.setWorkflow('000000000000000000000000', null).catch(error => {
                expect(error).to.exist;
                expect(error).to.be.eql('Organization not found');

                done();
            });
        });

        it('Should clear workflow when empty workflow is provided', done => {
            organizationManager.setWorkflow(organization._id, []).then(org => {
                expect(org).to.exist;
                expect(org).have.property('workflow').that.satisfies(value => {
                    expect(value).to.be.an('array');
                    expect(value).to.have.length(0);

                    return true;
                });

                done();
            });
        });

        it('Should create workflow', done => {
            let workflow: Task[] = [];
            workflow.push(new Task(1, organization, TaskType.HUMAN));
            workflow.push(new Task(2, organization, TaskType.CAR));
            workflow.push(new Task(3, organization2, TaskType.CAR));


            organizationManager.setWorkflow(organization._id, workflow).then((org: Organization) => {
                expect(org).to.exist;
                expect(org).to.have.property('workflow').that.satisfies(workflow => {
                    expect(workflow).to.exist;
                    expect(workflow).to.be.an('array');
                    expect(workflow).to.have.length(3);
                    expect(workflow).to.satisfy(wf => {
                        wf.forEach(task => {
                            expect(task).to.exist;
                            expect(task).to.have.property('order').that.is.a('number');
                            expect(task).to.have.property('organization').that.is.a('object');
                            expect(task).to.have.property('type').that.is.a('string');
                        });

                        return true;
                    });

                    return true;
                });

                done();
            });
        });
        it('Should clear workflow duplicates if exists (no duplicate organization + task)', done => {
            let workflow: Task[] = [];
            workflow.push(new Task(1, organization, TaskType.HUMAN));
            workflow.push(new Task(2, organization, TaskType.HUMAN));
            workflow.push(new Task(3, organization, TaskType.CAR));
            workflow.push(new Task(4, organization2, TaskType.HUMAN));
            workflow.push(new Task(5, organization2, TaskType.CAR));
            workflow.push(new Task(6, organization2, TaskType.CAR));


            organizationManager.setWorkflow(organization._id, workflow).then((org: Organization) => {
                expect(org).to.exist;
                expect(org).to.have.property('workflow').that.satisfies(workflow => {
                    expect(workflow).to.exist;
                    expect(workflow).to.be.an('array');
                    expect(workflow).to.have.length(4);
                    expect(workflow).to.satisfy(wf => {
                        wf.forEach(task => {
                            expect(task).to.exist;
                            expect(task).to.have.property('order').that.is.a('number');
                            expect(task).to.have.property('organization').that.is.a('object');
                            expect(task).to.have.property('type').that.is.a('string');
                        });

                        return true;
                    });

                    return true;
                });

                done();
            });
        });
    });

    describe('#getWorkflow', () => {
        let organization = null;

        beforeEach(done => {
            organizationManager.create(new Organization('org')).then(org => {
                organization = org;

                done();
            });
        });

        it('Should throw error when organization not exists', done => {
            organizationManager.getWorkflow('000000000000000000000000').catch(error => {
                expect(error).to.exist;
                expect(error).to.eql('Organization not found');

                done();
            });
        });

        it('Should return empty array when workflow not initialized for organization', done => {
            organizationManager.getWorkflow(organization._id).then((workflow: Task[]) => {
                expect(workflow).to.exist;
                expect(workflow).to.be.an('array');
                expect(workflow).to.have.length(0);

                done();
            });
        });

        it('Should return workflow for the specific organization', done => {
            let workflow: Task[] = [];
            workflow.push(new Task(1, organization, TaskType.HUMAN));
            workflow.push(new Task(2, organization, TaskType.CAR));

            organizationManager.setWorkflow(organization._id, workflow).then((org: Organization) => {
                expect(org).to.exist;
                organizationManager.getWorkflow(org._id).then((workflow: Task[]) => {
                    console.log(workflow);
                    expect(workflow).to.exist;
                    expect(workflow).to.be.an('array');
                    expect(workflow).to.have.length(2);
                    expect(workflow).to.satisfy((workflow: Task[]) => {
                        workflow.forEach(task => {
                            expect(task).to.have.property('order')
                            expect(task).to.have.property('type');
                            expect(task).to.have.property('organization').that.satisfies(org => {
                                expect(org).to.exist;
                                expect(org).to.have.property('name');
                                expect(org).to.have.property('_id');

                                return true;
                            });
                        });

                        return true;
                    });

                    done();
                });
            });
        });
    });
});