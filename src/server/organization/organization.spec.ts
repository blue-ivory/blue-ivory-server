import { IUser } from './../user/user.interface';
import { ICollection } from './../helpers/collection';
import { User } from './../user/user.class';
import { Types } from 'mongoose';
import { expect } from 'chai';
import { Organization } from './organization.class';
import { IOrganization } from "./organization.interface";
import { ITask } from "../workflow/task.interface";
import { TaskType } from "../workflow/task-type.enum";

describe('Organization', () => {
    describe('#createOrganization', () => {
        it('Should create organization', done => {
            Organization.createOrganization('organization').then((organization: IOrganization) => {
                expect(organization).to.exist;
                expect(organization).to.have.property('name', 'organization');
                expect(organization).to.have.property('_id');
                expect(organization).to.have.property('workflow').that.satisfies((workflow: ITask[]) => {
                    expect(workflow).to.exist;
                    expect(workflow).to.be.an('array');
                    expect(workflow).to.have.length(0);

                    return true;
                });

                done();
            });
        });

        it('Should throw an error when organization already exists', done => {
            Organization.createOrganization('organization').then(() => {
                return Organization.createOrganization('organization');
            }).catch(err => {
                expect(err).to.exist;
                expect(err).to.have.property('code', 11000);

                done();
            });
        });

        it('Should throw an error when missing organization fields', done => {
            Organization.createOrganization(null).catch(err => {
                expect(err).to.exist;
                expect(err).to.have.property('name', 'ValidationError');
                expect(err).to.have.property('message', 'Organization validation failed');

                done();
            })
        });
    });

    describe('#updateOrganization', () => {
        it('Should return null when organization not exists', done => {

            let organization = <IOrganization>{
                name: 'notExistingOrganization',
                _id: new Types.ObjectId()
            };

            Organization.updateOrganization(organization).then((updatedOrganization: IOrganization) => {
                expect(updatedOrganization).to.not.exist;

                done();
            });
        });

        it('Should throw an error when duplicate name found', done => {
            Organization.createOrganization('organizationOne').then(() => {
                return Organization.createOrganization('organizationTwo');
            }).then((organizationTwo: IOrganization) => {
                organizationTwo.name = 'organizationOne';
                return Organization.updateOrganization(organizationTwo);
            }).catch(err => {
                expect(err).to.exist;
                expect(err).to.have.property('code', 11000);

                done();
            });
        });

        it('Should update organization', done => {
            Organization.createOrganization('organization').then((organization: IOrganization) => {
                expect(organization).to.exist;
                expect(organization).to.have.property('name', 'organization');

                organization.name = 'testOrganization';
                return Organization.updateOrganization(organization);
            }).then((organization: IOrganization) => {
                expect(organization).to.exist;
                expect(organization).to.have.property('name', 'testOrganization');

                done();
            });
        });
    });

    describe('#findOrganization', () => {
        it('Should return null when id not found', done => {
            Organization.findOrganization(new Types.ObjectId()).then((organization: IOrganization) => {
                expect(organization).to.not.exist;

                done();
            });
        });

        it('Should return organization by ID', done => {
            Organization.createOrganization('organization').then((organization: IOrganization) => {
                return Organization.findOrganization(organization._id);
            }).then((foundOrganization: IOrganization) => {
                expect(foundOrganization).to.exist;
                expect(foundOrganization).to.have.property('name', 'organization');

                done();
            });
        });
    });

    describe('#searchOrganizations', () => {
        let organization = <IOrganization>null;
        beforeEach(done => {
            Promise.all([
                Organization.createOrganization('org one'),
                Organization.createOrganization('org two'),
                Organization.createOrganization('org three'),
                Organization.createOrganization('org four')
            ]).then((values: IOrganization[]) => {
                organization = values[0];
                done();
            });
        });

        it('Should return all organization when no searchTerm is provided', done => {
            Organization.searchOrganizations('').then((collection: ICollection<IOrganization>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 4);
                expect(collection).to.have.property('set').that.satisfies((set: IOrganization[]) => {
                    expect(set).to.exist;
                    expect(set).to.be.an('array');
                    expect(set).to.have.length(4);

                    return true;
                });

                done();
            });
        });

        it('Should return 0 organization when searchTerm don\'t match any name', done => {
            Organization.searchOrganizations('notExistingOrganization').then((collection: ICollection<IOrganization>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 0);
                expect(collection).to.have.property('set').that.satisfies((set: IOrganization[]) => {
                    expect(set).to.exist;
                    expect(set).to.be.an('array');
                    expect(set).to.have.length(0);

                    return true;
                });

                done();
            });
        });

        it('Should return organizations filtered by searchTerm', done => {
            Promise.all(['org', 'org ', 'o', 'r', 'g'].map(name => {
                return Organization.searchOrganizations(name);
            })).then((collections: ICollection<IOrganization>[]) => {
                collections.forEach((collection: ICollection<IOrganization>) => {
                    expect(collection).to.exist;
                    expect(collection).to.have.property('totalCount', 4);
                    expect(collection).to.have.property('set').that.satisfies((set: IOrganization[]) => {
                        expect(set).to.be.an('array');
                        expect(set).to.have.length(4);

                        return true;
                    });
                });

                return Promise.all(['one', 'two', 'three', 'four', 'n', 'u', 'f'].map(name => {
                    return Organization.searchOrganizations(name);
                }))
            }).then((collections: ICollection<IOrganization>[]) => {
                collections.forEach((collection: ICollection<IOrganization>) => {
                    expect(collection).to.exist;
                    expect(collection).to.have.property('totalCount', 1);
                    expect(collection).to.have.property('set').that.satisfies((set: IOrganization[]) => {
                        expect(set).to.be.an('array');
                        expect(set).to.have.length(1);

                        return true;
                    });
                });

                return Promise.all(['e', 't'].map(name => {
                    return Organization.searchOrganizations(name);
                }))
            }).then((collections: ICollection<IOrganization>[]) => {
                collections.forEach((collection: ICollection<IOrganization>) => {
                    expect(collection).to.exist;
                    expect(collection).to.have.property('totalCount', 2);
                    expect(collection).to.have.property('set').that.satisfies((set: IOrganization[]) => {
                        expect(set).to.be.an('array');
                        expect(set).to.have.length(2);

                        return true;
                    });
                });

                done();
            });
        });

        it('Should return organization with amount of users', done => {
            User.createUser('Ron', 'Borysovski', '123456', 'roni537@gmail.com').then((user: IUser) => {
                expect(user).to.exist;
                return User.setOrganization(user._id, organization._id);
            }).then((user: IUser) => {
                expect(user).to.exist;

                return Organization.searchOrganizations(organization.name);
            }).then((collection: ICollection<IOrganization>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 1);
                expect(collection).to.have.property('set').that.satisfies((set: IOrganization[]) => {
                    expect(set).to.be.an('array');
                    expect(set).to.have.length(1);
                    expect(set[0]).to.have.property('users', 1)
                    expect(set[0]).to.have.property('requests', 0);

                    return true;
                });

                done();
            });
        });
    });

    describe('#setWork', () => {

        let firstOrganization: IOrganization = null;
        let secondOrganization: IOrganization = null;

        beforeEach(done => {
            Organization.createOrganization('first organization')
                .then((org: IOrganization) => {
                    expect(org).to.exist;
                    firstOrganization = org;

                    return Organization.createOrganization('second organization');
                }).then((org: IOrganization) => {
                    expect(org).to.exist;
                    secondOrganization = org;

                    done();
                });
        });

        it('Should return null when organization not found', done => {
            Organization.setWorkflow(new Types.ObjectId(), null).then((organization: IOrganization) => {
                expect(organization).to.not.exist;

                done();
            });
        });

        it('Should create workflow', done => {
            let workflow: ITask[] = [];
            workflow.push(<ITask>{ order: 1, organization: firstOrganization, type: TaskType.HUMAN });
            workflow.push(<ITask>{ order: 2, organization: firstOrganization, type: TaskType.CAR });
            workflow.push(<ITask>{ order: 3, organization: secondOrganization, type: TaskType.HUMAN });


            Organization.setWorkflow(firstOrganization._id, workflow).then((organization: IOrganization) => {
                expect(organization).to.exist;
                expect(organization).to.have.property('workflow').that.satisfies(workflow => {
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

        it('Should clear workflow when empty workflow is provided', done => {
            Organization.setWorkflow(firstOrganization._id, []).then((organization: IOrganization) => {
                expect(organization).to.exist;
                expect(organization).have.property('workflow').that.satisfies(value => {
                    expect(value).to.be.an('array');
                    expect(value).to.have.length(0);

                    return true;
                });

                done();
            });
        });

        it('Should clear workflow duplicates if exists (organization+task)', done => {
            let workflow: ITask[] = [];
            <ITask>{ order: 2, organization: firstOrganization, type: TaskType.HUMAN }
            workflow.push(<ITask>{ order: 1, organization: firstOrganization, type: TaskType.HUMAN });
            workflow.push(<ITask>{ order: 2, organization: firstOrganization, type: TaskType.HUMAN });
            workflow.push(<ITask>{ order: 3, organization: firstOrganization, type: TaskType.CAR });
            workflow.push(<ITask>{ order: 4, organization: secondOrganization, type: TaskType.HUMAN });
            workflow.push(<ITask>{ order: 5, organization: secondOrganization, type: TaskType.CAR });
            workflow.push(<ITask>{ order: 6, organization: secondOrganization, type: TaskType.CAR });


            Organization.setWorkflow(firstOrganization._id, workflow).then((organization: IOrganization) => {
                expect(organization).to.exist;
                expect(organization).to.have.property('workflow').that.satisfies(workflow => {
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

        let organization: IOrganization = null;

        beforeEach(done => {
            Organization.createOrganization('organization').then((org: IOrganization) => {
                expect(org).to.exist;
                organization = org;

                done();
            });
        });

        it('Should return null when organization not found', done => {
            Organization.getWorkflow(new Types.ObjectId()).then((workflow: ITask[]) => {
                expect(workflow).to.not.exist;

                done();
            });
        });

        it('Should return empty array when workflow not initialized for organization', done => {
            Organization.getWorkflow(organization._id).then((workflow: ITask[]) => {
                expect(workflow).to.exist;
                expect(workflow).to.be.an('array');
                expect(workflow).to.have.length(0);

                done();
            });
        });

        it('Should return workflow for specific organization', done => {
            let workflow: ITask[] = [];

            workflow.push(<ITask>{ order: 1, organization: organization, type: TaskType.HUMAN });
            workflow.push(<ITask>{ order: 2, organization: organization, type: TaskType.CAR });

            Organization.setWorkflow(organization._id, workflow).then((org: IOrganization) => {
                expect(org).to.exist;
                Organization.getWorkflow(org._id).then((workflow: ITask[]) => {
                    expect(workflow).to.exist;
                    expect(workflow).to.be.an('array');
                    expect(workflow).to.have.length(2);
                    expect(workflow).to.satisfy((workflow: ITask[]) => {
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