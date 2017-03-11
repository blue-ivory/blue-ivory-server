import { OrganizationManager } from './../server/managers/organization.manager';
/// <reference path="../../typings/index.d.ts" />
import { Organization } from './../server/classes/organization';
import { Task, TaskType } from './../server/classes/task';
import { WorkflowManager } from './../server/managers/workflow.manager';
import { Workflow } from './../server/classes/workflow';
import { expect } from 'chai';

describe('WorkflowManager', () => {
    let workflowManager = new WorkflowManager();
    let organizationManager: OrganizationManager = new OrganizationManager;

    describe('#create', () => {
        let organization1: Organization;
        let organization2: Organization;

        beforeEach(done => {
            Promise.all([organizationManager.create(new Organization('org1')), organizationManager.create(new Organization('org2'))])
                .then(values => {
                    organization1 = values[0];
                    organization2 = values[1];

                    done();
                });

        })

        it('Should throw an error when organization not exists', done => {
            let task = new Task();
            task.organization = new Organization('test');
            task.type = TaskType.HUMAN;

            let workflow = new Workflow();
            workflow.tasks.push(task);

            workflowManager.create(workflow).catch(error => {
                expect(error).to.exist;
                expect(error).to.have.property('message', 'Workflow validation failed');

                done();
            })
        });

        it('Should throw an error when no organization is set', done => {
            let task = new Task();
            task.type = TaskType.HUMAN;

            let workflow = new Workflow();

            workflowManager.create(workflow).catch(error => {
                expect(error).to.exist;
                expect(error).to.have.property('message', 'Workflow validation failed');

                done();
            })
        });

        it('Should throw an error when no task created', done => {
            let workflow = new Workflow();

            workflowManager.create(workflow).catch(error => {
                expect(error).to.exist;
                expect(error).to.have.property('message', 'Workflow validation failed');

                done();
            })
        });

        it('Should create a workflow with single task', done => {
            let task = new Task();
            task.organization = organization1;
            task.type = TaskType.HUMAN;

            let workflow = new Workflow();
            workflow.tasks.push(task);

            workflowManager.create(workflow).then((workflow: Workflow) => {
                expect(workflow).to.exist;
                expect(workflow).to.have.property('_id');
                expect(workflow).to.have.property('tasks');
                expect(workflow.tasks).to.be.an('array');
                expect(workflow.tasks).to.have.length(1);
                expect(workflow.tasks[0]).to.have.property('type', TaskType.HUMAN);
                expect(workflow.tasks[0]).to.have.property('organization');
                expect(workflow.tasks[0].organization).to.be.an('object');
                expect(workflow.tasks[0].organization).to.have.property('name', 'org1');

                done();
            });
        });
        it('Should create a workflow with multiple tasks', done => {
            let task1 = new Task();
            task1.organization = organization1;
            task1.type = TaskType.HUMAN;

            let task2 = new Task();
            task2.organization = organization2;
            task2.type = TaskType.HUMAN;

            let task3 = new Task();
            task3.organization = organization2;
            task3.type = TaskType.CAR;

            let workflow = new Workflow();
            workflow.tasks.push(task1);
            workflow.tasks.push(task2);
            workflow.tasks.push(task3);

            workflowManager.create(workflow).then((workflow: Workflow) => {
                expect(workflow).to.exist;
                expect(workflow).to.have.property('_id');
                expect(workflow).to.have.property('tasks');
                expect(workflow.tasks).to.be.an('array');
                expect(workflow.tasks).to.have.length(3);

                done();
            });
        });
    });

    describe('#read', () => {
        it('Should return null when Workflow not exists');
        it('Should find workflow by organization id');
    });

    describe('#update', () => {
        it('Should throw an error when workflow not exists');
        it('Should update an Workflow');
        it('Should not set duplicate task if exists');
    });
});