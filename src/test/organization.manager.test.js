"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const organization_manager_1 = require("./../server/managers/organization.manager");
const user_manager_1 = require("./../server/managers/user.manager");
const organization_1 = require("./../server/classes/organization");
const user_1 = require("./../server/classes/user");
const task_1 = require("./../server/classes/task");
const chai_1 = require("chai");
const mongoose = require("mongoose");
var Types = mongoose.Types;
describe('OrganizationManager', () => {
    let organizationManager = new organization_manager_1.OrganizationManager();
    let userManager = new user_manager_1.UserManager();
    describe('#create', () => {
        it('Should throw an error when invalid data', done => {
            organizationManager.create(new organization_1.Organization('')).catch(error => {
                chai_1.expect(error).to.exist;
                chai_1.expect(error).to.have.property('errors');
                chai_1.expect(error.errors).to.have.property('name');
                chai_1.expect(error.errors.name).to.have.property('kind', 'required');
                done();
            });
        });
        it('Should create organization', done => {
            organizationManager.create(new organization_1.Organization('organization')).then(organization => {
                chai_1.expect(organization).to.exist;
                chai_1.expect(organization).to.have.property('_id');
                chai_1.expect(organization).to.have.property('name', 'organization');
                done();
            });
        });
        it('Should throw an error when organization with same name exists', done => {
            organizationManager.create(new organization_1.Organization('organization')).then(organization => {
                chai_1.expect(organization).to.exist;
                organizationManager.create(new organization_1.Organization('organization')).catch(error => {
                    chai_1.expect(error).to.exist;
                    chai_1.expect(error).to.have.property('code', 11000);
                    done();
                });
            });
        });
    });
    describe('#all', () => {
        it('Should return nothing when db is empty', done => {
            organizationManager.all().then(organizations => {
                chai_1.expect(organizations).to.exist;
                chai_1.expect(organizations).to.be.an('array');
                chai_1.expect(organizations).to.have.length(0);
                done();
            });
        });
        it('Should return all organizations from db', done => {
            organizationManager.create(new organization_1.Organization('organization')).then(() => {
                organizationManager.create(new organization_1.Organization('organization2')).then(() => {
                    organizationManager.create(new organization_1.Organization('organization3')).then(() => {
                        organizationManager.all().then(organizations => {
                            chai_1.expect(organizations).to.exist;
                            chai_1.expect(organizations).to.be.an('array');
                            chai_1.expect(organizations).to.have.length(3);
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
                chai_1.expect(organization).to.not.exist;
                done();
            });
        });
        it('Should return organization by id', done => {
            organizationManager.create(new organization_1.Organization('bName')).then(organization => {
                chai_1.expect(organization).to.exist;
                organizationManager.read(organization._id).then(foundOrganization => {
                    chai_1.expect(foundOrganization).to.exist;
                    chai_1.expect(foundOrganization).to.have.property('name', 'bName');
                    done();
                });
            });
        });
    });
    describe('#update', () => {
        it('Should do nothing when organization not exists', done => {
            let organization = new organization_1.Organization('name');
            organization._id = new Types.ObjectId();
            organizationManager.update(organization).then(organization => {
                chai_1.expect(organization).to.not.exist;
                done();
            });
        });
        it('Should throw an error when duplicated name found', done => {
            organizationManager.create(new organization_1.Organization('bName')).then(() => {
                organizationManager.create(new organization_1.Organization('bName2')).then(organization => {
                    chai_1.expect(organization).to.exist;
                    organization.name = 'bName';
                    organizationManager.update(organization).catch(error => {
                        chai_1.expect(error).to.exist;
                        chai_1.expect(error).to.have.property('code', 11000);
                        done();
                    });
                });
            });
        });
        it('Should update organization', done => {
            organizationManager.create(new organization_1.Organization('name')).then(organization => {
                chai_1.expect(organization).to.exist;
                organization.name = 'bName';
                organizationManager.update(organization).then(updatedOrganization => {
                    chai_1.expect(updatedOrganization).to.exist;
                    chai_1.expect(updatedOrganization).to.have.property('name', 'bName');
                    done();
                });
            });
        });
    });
    describe('#delete', () => {
        it('Should do nothing when organization not found', done => {
            organizationManager.delete('000000000000000000000000').then(organization => {
                chai_1.expect(organization).to.not.exist;
                done();
            });
        });
        it('Should delete the organization', done => {
            organizationManager.create(new organization_1.Organization('name')).then(organization => {
                chai_1.expect(organization).to.exist;
                organizationManager.delete(organization._id).then(deletedOrganization => {
                    chai_1.expect(deletedOrganization).to.exist;
                    organizationManager.read(organization._id).then(organization => {
                        chai_1.expect(organization).to.not.exist;
                        done();
                    });
                });
            });
        });
    });
    describe('#search', () => {
        beforeEach((done) => {
            Promise.all([
                organizationManager.create(new organization_1.Organization('org one')),
                organizationManager.create(new organization_1.Organization('org two')),
                organizationManager.create(new organization_1.Organization('org three')),
                organizationManager.create(new organization_1.Organization('org four'))
            ]).then((values) => {
                userManager.create(new user_1.User('t', 'e', 's', 't')).then(user => {
                    userManager.setOrganization('s', values[0]._id).then(() => done());
                });
            });
        });
        it('Should return all organizations when no searchTerm provided', done => {
            organizationManager.search('').then(result => {
                chai_1.expect(result).to.exist;
                chai_1.expect(result).to.have.property('totalCount', 4);
                chai_1.expect(result).to.have.property('organizations');
                chai_1.expect(result.organizations).to.be.an('array');
                chai_1.expect(result.organizations).to.have.length(4);
                done();
            });
        });
        it('Should return nothing when searchTerm don\'t match any name', done => {
            organizationManager.search('test').then(result => {
                chai_1.expect(result).to.exist;
                chai_1.expect(result).to.have.property('totalCount', 0);
                chai_1.expect(result).to.have.property('organizations');
                chai_1.expect(result.organizations).to.be.an('array');
                chai_1.expect(result.organizations).to.have.length(0);
                done();
            });
        });
        it('Should return organizations filtered by searchTerm', done => {
            Promise.all(['org', 'org ', 'o', 'r', 'g'].map(name => {
                return organizationManager.search(name);
            })).then(values => {
                values.forEach(value => {
                    chai_1.expect(value).to.exist;
                    chai_1.expect(value).to.have.property('totalCount', 4);
                    chai_1.expect(value).to.have.property('organizations');
                    chai_1.expect(value.organizations).to.be.an('array');
                    chai_1.expect(value.organizations).to.have.length(4);
                });
                return Promise.all(['one', 'two', 'three', 'four', 'n', 'u', 'f'].map(name => {
                    return organizationManager.search(name);
                }));
            }).then(values => {
                values.forEach(value => {
                    chai_1.expect(value).to.exist;
                    chai_1.expect(value).to.have.property('totalCount', 1);
                    chai_1.expect(value).to.have.property('organizations');
                    chai_1.expect(value.organizations).to.be.an('array');
                    chai_1.expect(value.organizations).to.have.length(1);
                });
                return Promise.all(['e', 't'].map(name => {
                    return organizationManager.search(name);
                }));
            }).then(values => {
                values.forEach(value => {
                    chai_1.expect(value).to.exist;
                    chai_1.expect(value).to.have.property('totalCount', 2);
                    chai_1.expect(value).to.have.property('organizations');
                    chai_1.expect(value.organizations).to.be.an('array');
                    chai_1.expect(value.organizations).to.have.length(2);
                });
                done();
            });
        });
        it('Should return organization with amount of users', done => {
            organizationManager.search('').then(result => {
                chai_1.expect(result).to.exist;
                chai_1.expect(result).to.have.property('totalCount', 4);
                chai_1.expect(result).to.have.property('organizations');
                chai_1.expect(result.organizations).to.be.an('array');
                chai_1.expect(result.organizations).to.have.length(4);
                chai_1.expect(result.organizations).to.satisfy((organizations) => {
                    return organizations.some(organization => {
                        return organization.users === 1;
                    });
                });
                done();
            });
        });
    });
    describe('#setWorkflow', () => {
        let organization = null;
        let organization2 = null;
        beforeEach(done => {
            organizationManager.create(new organization_1.Organization('org')).then(org => {
                chai_1.expect(org).to.exist;
                chai_1.expect(org).to.have.property('workflow').that.satisfies(value => {
                    chai_1.expect(value).to.be.an('array');
                    chai_1.expect(value).to.have.length(0);
                    return true;
                });
                organization = org;
                return organizationManager.create(new organization_1.Organization('org2'));
            }).then(org2 => {
                chai_1.expect(org2).to.exist;
                chai_1.expect(org2).to.have.property('workflow').that.satisfies(value => {
                    chai_1.expect(value).to.be.an('array');
                    chai_1.expect(value).to.have.length(0);
                    return true;
                });
                organization2 = org2;
                done();
            });
        });
        it('Should throw error when organization not found', done => {
            organizationManager.setWorkflow('000000000000000000000000', null).catch(error => {
                chai_1.expect(error).to.exist;
                chai_1.expect(error).to.be.eql('Organization not found');
                done();
            });
        });
        it('Should clear workflow when empty workflow is provided', done => {
            organizationManager.setWorkflow(organization._id, []).then(org => {
                chai_1.expect(org).to.exist;
                chai_1.expect(org).have.property('workflow').that.satisfies(value => {
                    chai_1.expect(value).to.be.an('array');
                    chai_1.expect(value).to.have.length(0);
                    return true;
                });
                done();
            });
        });
        it('Should create workflow', done => {
            let workflow = [];
            workflow.push(new task_1.Task(1, organization, task_1.TaskType.HUMAN));
            workflow.push(new task_1.Task(2, organization, task_1.TaskType.CAR));
            workflow.push(new task_1.Task(3, organization2, task_1.TaskType.CAR));
            organizationManager.setWorkflow(organization._id, workflow).then((org) => {
                chai_1.expect(org).to.exist;
                chai_1.expect(org).to.have.property('workflow').that.satisfies(workflow => {
                    chai_1.expect(workflow).to.exist;
                    chai_1.expect(workflow).to.be.an('array');
                    chai_1.expect(workflow).to.have.length(3);
                    chai_1.expect(workflow).to.satisfy(wf => {
                        wf.forEach(task => {
                            chai_1.expect(task).to.exist;
                            chai_1.expect(task).to.have.property('order').that.is.a('number');
                            chai_1.expect(task).to.have.property('organization').that.is.a('object');
                            chai_1.expect(task).to.have.property('type').that.is.a('string');
                        });
                        return true;
                    });
                    return true;
                });
                done();
            });
        });
        it('Should clear workflow duplicates if exists (no duplicate organization + task)', done => {
            let workflow = [];
            workflow.push(new task_1.Task(1, organization, task_1.TaskType.HUMAN));
            workflow.push(new task_1.Task(2, organization, task_1.TaskType.HUMAN));
            workflow.push(new task_1.Task(3, organization, task_1.TaskType.CAR));
            workflow.push(new task_1.Task(4, organization2, task_1.TaskType.HUMAN));
            workflow.push(new task_1.Task(5, organization2, task_1.TaskType.CAR));
            workflow.push(new task_1.Task(6, organization2, task_1.TaskType.CAR));
            organizationManager.setWorkflow(organization._id, workflow).then((org) => {
                chai_1.expect(org).to.exist;
                chai_1.expect(org).to.have.property('workflow').that.satisfies(workflow => {
                    chai_1.expect(workflow).to.exist;
                    chai_1.expect(workflow).to.be.an('array');
                    chai_1.expect(workflow).to.have.length(4);
                    chai_1.expect(workflow).to.satisfy(wf => {
                        wf.forEach(task => {
                            chai_1.expect(task).to.exist;
                            chai_1.expect(task).to.have.property('order').that.is.a('number');
                            chai_1.expect(task).to.have.property('organization').that.is.a('object');
                            chai_1.expect(task).to.have.property('type').that.is.a('string');
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
            organizationManager.create(new organization_1.Organization('org')).then(org => {
                organization = org;
                done();
            });
        });
        it('Should throw error when organization not exists', done => {
            organizationManager.getWorkflow('000000000000000000000000').catch(error => {
                chai_1.expect(error).to.exist;
                chai_1.expect(error).to.eql('Organization not found');
                done();
            });
        });
        it('Should return empty array when workflow not initialized for organization', done => {
            organizationManager.getWorkflow(organization._id).then((workflow) => {
                chai_1.expect(workflow).to.exist;
                chai_1.expect(workflow).to.be.an('array');
                chai_1.expect(workflow).to.have.length(0);
                done();
            });
        });
        it('Should return workflow for the specific organization', done => {
            let workflow = [];
            workflow.push(new task_1.Task(1, organization, task_1.TaskType.HUMAN));
            workflow.push(new task_1.Task(2, organization, task_1.TaskType.CAR));
            organizationManager.setWorkflow(organization._id, workflow).then((org) => {
                chai_1.expect(org).to.exist;
                organizationManager.getWorkflow(org._id).then((workflow) => {
                    console.log(workflow);
                    chai_1.expect(workflow).to.exist;
                    chai_1.expect(workflow).to.be.an('array');
                    chai_1.expect(workflow).to.have.length(2);
                    chai_1.expect(workflow).to.satisfy((workflow) => {
                        workflow.forEach(task => {
                            chai_1.expect(task).to.have.property('order');
                            chai_1.expect(task).to.have.property('type');
                            chai_1.expect(task).to.have.property('organization').that.satisfies(org => {
                                chai_1.expect(org).to.exist;
                                chai_1.expect(org).to.have.property('name');
                                chai_1.expect(org).to.have.property('_id');
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
