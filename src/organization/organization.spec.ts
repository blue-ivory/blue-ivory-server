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
        it('Should create organization', async () => {
            let organization = await Organization.createOrganization('organization');
            expect(organization).to.exist;
            expect(organization).to.have.property('name', 'organization');
            expect(organization).to.have.property('_id');
            expect(organization).to.have.property('workflow').which.is.an('array').with.length(0);
        });

        it('Should throw an error when organization already exists', async () => {
            try {
                await Organization.createOrganization('organization');
                await Organization.createOrganization('organization');
            } catch (err) {
                expect(err).to.exist;
                expect(err).to.have.property('code', 11000);
            }
        });

        it('Should throw an error when missing organization fields', async () => {
            try {
                await Organization.createOrganization(null);
            } catch (err) {
                expect(err).to.exist;
                expect(err).to.have.property('name', 'ValidationError');
            }
        });
    });

    describe('#updateOrganization', () => {
        it('Should return null when organization not exists', async () => {

            let organization = <IOrganization>{
                name: 'notExistingOrganization',
                _id: new Types.ObjectId()
            };

            let updatedOrganization = await Organization.updateOrganization(organization);
            expect(updatedOrganization).to.not.exist;
        });

        it('Should throw an error when duplicate name found', async () => {
            try {
                await Organization.createOrganization('organizationOne');
                let org = <IOrganization>await Organization.createOrganization('organizationTwo');
                org.name = 'organizationOne';
                await Organization.updateOrganization(org);
            } catch (err) {
                expect(err).to.exist;
                expect(err).to.have.property('code', 11000);
            }
        });

        it('Should update organization', async () => {
            let organization = <IOrganization>await Organization.createOrganization('organization');
            expect(organization).to.exist;
            expect(organization).to.have.property('name', 'organization');

            organization.name = 'testOrganization';
            organization = <IOrganization>await Organization.updateOrganization(organization);
            expect(organization).to.exist;
            expect(organization).to.have.property('name', 'testOrganization');
        });
    });

    describe('#findOrganization', () => {
        it('Should return null when id not found', async () => {
            let organization = await Organization.findOrganization(new Types.ObjectId());
            expect(organization).to.not.exist;
        });

        it('Should return organization by ID', async () => {
            let organization = <IOrganization>await Organization.createOrganization('organization');
            let foundOrganization = <IOrganization>await Organization.findOrganization(organization._id);
            expect(foundOrganization).to.exist;
            expect(foundOrganization).to.have.property('name', 'organization');
        });
    });

    describe('#getRequestableOrganization', () => {

        beforeEach(async () => {
            await Organization.createOrganization('org1');
            await Organization.createOrganization('org2');
        })

        it('Should return null if no requestable organizations', async () => {
            let organizations = await Organization.getRequestableOrganization();
            expect(organizations).to.exist;
            expect(organizations).to.be.an('array').with.length(0);
        });

        it('Should return organizations only with workflow', async () => {
            let organization = <IOrganization>await Organization.createOrganization('organizationWithWorkflow');
            expect(organization).to.exist;
            organization = <IOrganization>await Organization.setWorkflow(organization._id,
                [
                    <ITask>{ order: 1, type: TaskType.HUMAN, organization: organization },
                    <ITask>{ order: 2, type: TaskType.CAR, organization: organization }
                ]);
            expect(organization).to.exist;

            let organizations = <IOrganization[]>await Organization.getRequestableOrganization();
            expect(organizations).to.exist.and.to.be.an('array').with.length(1);
            expect(organizations[0]).to.have.property('name', 'organizationWithWorkflow');
        });
    });

    describe('#searchOrganizations', () => {
        let organization = <IOrganization>null;
        beforeEach(async () => {
            let values = await Promise.all([
                Organization.createOrganization('org one'),
                Organization.createOrganization('org two'),
                Organization.createOrganization('org three'),
                Organization.createOrganization('org four')
            ]);

            organization = <IOrganization>values[0];
        });

        it('Should return all organization when no searchTerm is provided', async () => {
            let collection = await Organization.searchOrganizations('');
            expect(collection).to.exist;
            expect(collection).to.have.property('totalCount', 4);
            expect(collection).to.have.property('set').which.is.an('array').with.length(4);
        });

        it('Should return 0 organization when searchTerm don\'t match any name', async () => {
            let collection = await Organization.searchOrganizations('notExistingOrganization');
            expect(collection).to.exist;
            expect(collection).to.have.property('totalCount', 0);
            expect(collection).to.have.property('set').which.is.an('array').with.length(0);
        });

        it('Should return organizations filtered by searchTerm', async () => {
            let collections = await Promise.all(['org', 'org ', 'o', 'r', 'g'].map(name => {
                return Organization.searchOrganizations(name);
            }));

            collections.forEach((collection: ICollection<IOrganization>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 4);
                expect(collection).to.have.property('set').which.is.an('array').with.length(4);
            });

            collections = await Promise.all(['one', 'two', 'three', 'four', 'n', 'u', 'f'].map(name => {
                return Organization.searchOrganizations(name);
            }));

            collections.forEach((collection: ICollection<IOrganization>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 1);
                expect(collection).to.have.property('set').which.is.an('array').with.length(1);
            });

            collections = await Promise.all(['e', 't'].map(name => {
                return Organization.searchOrganizations(name);
            }))
            collections.forEach((collection: ICollection<IOrganization>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 2);
                expect(collection).to.have.property('set').which.is.an('array').with.length(2);
            });
        });

        it('Should return organization with amount of users', async () => {
            let user = <IUser>await User.createUser('Ron', 'Borysovski', '123456', 'roni537@gmail.com');
            expect(user).to.exist;
            user = <IUser>await User.setOrganization(user._id, organization._id);
            expect(user).to.exist;

            let collection = await Organization.searchOrganizations(organization.name);
            expect(collection).to.exist;
            expect(collection).to.have.property('totalCount', 1);
            expect(collection).to.have.property('set').that.satisfies((set: IOrganization[]) => {
                expect(set).to.be.an('array');
                expect(set).to.have.length(1);
                expect(set[0]).to.have.property('users', 1)
                expect(set[0]).to.have.property('requests', 0);

                return true;
            });
        });
    });

    describe('#setWorkflow', () => {

        let firstOrganization: IOrganization = null;
        let secondOrganization: IOrganization = null;
        let thirdOrganization: IOrganization = null;

        beforeEach(async () => {
            firstOrganization = <IOrganization>await Organization.createOrganization('first organization');
            secondOrganization = <IOrganization>await Organization.createOrganization('second organization');
            thirdOrganization = <IOrganization>await Organization.createOrganization('third organization');
        });

        it('Should return null when organization not found', async () => {
            let organization = await Organization.setWorkflow(new Types.ObjectId(), null);
            expect(organization).to.not.exist;
        });

        it('Should create workflow', async () => {
            let workflow: ITask[] = [];
            workflow.push(<ITask>{ order: 1, organization: firstOrganization, type: TaskType.HUMAN });
            workflow.push(<ITask>{ order: 2, organization: firstOrganization, type: TaskType.CAR });
            workflow.push(<ITask>{ order: 3, organization: secondOrganization, type: TaskType.HUMAN });

            let organization = await Organization.setWorkflow(firstOrganization._id, workflow);
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
        });

        it('Should clear workflow when empty workflow is provided', async () => {
            let organization = await Organization.setWorkflow(firstOrganization._id, []);
            expect(organization).to.exist;
            expect(organization).have.property('workflow').which.is.an('array').with.length(0);
        });

        it('Should clear workflow duplicates if exists (organization+task)', async () => {
            let workflow: ITask[] = [];
            <ITask>{ order: 2, organization: firstOrganization, type: TaskType.HUMAN }
            workflow.push(<ITask>{ order: 1, organization: firstOrganization, type: TaskType.HUMAN });
            workflow.push(<ITask>{ order: 2, organization: firstOrganization, type: TaskType.HUMAN });
            workflow.push(<ITask>{ order: 3, organization: firstOrganization, type: TaskType.CAR });
            workflow.push(<ITask>{ order: 4, organization: secondOrganization, type: TaskType.HUMAN });
            workflow.push(<ITask>{ order: 5, organization: secondOrganization, type: TaskType.CAR });
            workflow.push(<ITask>{ order: 6, organization: secondOrganization, type: TaskType.CAR });

            let organization = await Organization.setWorkflow(firstOrganization._id, workflow);
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
        });

        it('Should create tags for the organizations based on the workflow order', async () => {
            let workflow: ITask[] = [];
            workflow.push(<ITask>{ order: 1, organization: firstOrganization, type: TaskType.HUMAN });
            workflow.push(<ITask>{ order: 2, organization: secondOrganization, type: TaskType.HUMAN });
            workflow.push(<ITask>{ order: 3, organization: thirdOrganization, type: TaskType.HUMAN });

            let organization = await Organization.setWorkflow(thirdOrganization._id, workflow);
            expect(organization).to.exist;
            expect(organization).to.have.property('workflow');

            let org = await Organization.findOrganization(firstOrganization._id);
            expect(org).to.exist;
            expect(org).to.have.property('tags').which.is.an('array').with.length(1);

            org = await Organization.findOrganization(secondOrganization._id);
            expect(org).to.exist;
            expect(org).to.have.property('tags').which.is.an('array').with.length(1);

            org = await Organization.findOrganization(thirdOrganization._id);
            expect(org).to.exist;
            expect(org).to.have.property('tags').which.is.an('array').with.length(0);
        });

        it('Should remove tags if workflow changed and not contains organization', async () => {
            let workflow: ITask[] = [];
            workflow.push(<ITask>{ order: 1, organization: firstOrganization, type: TaskType.HUMAN });
            workflow.push(<ITask>{ order: 2, organization: secondOrganization, type: TaskType.HUMAN });

            let organization = await Organization.setWorkflow(secondOrganization._id, workflow);
            expect(organization).to.exist;
            let org = await Organization.findOrganization(firstOrganization._id);
            expect(org).to.exist;
            expect(org).to.have.property('tags').which.is.an('array').with.length(1);

            await Organization.setWorkflow(secondOrganization._id, []);

            org = await Organization.findOrganization(firstOrganization._id);
            expect(org).to.exist;
            expect(org).to.have.property('tags').which.is.an('array').with.length(0);

        });
    });

    describe('#getWorkflow', () => {

        let organization: IOrganization = null;

        beforeEach(async () => {
            organization = <IOrganization>await Organization.createOrganization('organization');
        });

        it('Should return null when organization not found', async () => {
            let workflow = await Organization.getWorkflow(new Types.ObjectId());
        });

        it('Should return empty array when workflow not initialized for organization', async () => {
            let workflow = await Organization.getWorkflow(organization._id);
            expect(workflow).to.exist;
            expect(workflow).to.be.an('array');
            expect(workflow).to.have.length(0);
        });

        it('Should return workflow for specific organization', async () => {
            let workflow: ITask[] = [];

            workflow.push(<ITask>{ order: 1, organization: organization, type: TaskType.HUMAN });
            workflow.push(<ITask>{ order: 2, organization: organization, type: TaskType.CAR });

            let org = await Organization.setWorkflow(organization._id, workflow);
            expect(org).to.exist;
            let _workflow = await Organization.getWorkflow(org._id);
            expect(_workflow).to.exist;
            expect(_workflow).to.be.an('array');
            expect(_workflow).to.have.length(2);
            expect(_workflow).to.satisfy((_workflow: ITask[]) => {
                _workflow.forEach(task => {
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
        });
    });
});