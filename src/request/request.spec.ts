import { expect } from 'chai';
import { Types } from 'mongoose';
import { ICollection } from "../helpers/collection";
import { Organization } from "../organization/organization.class";
import { IOrganization } from "../organization/organization.interface";
import { PermissionType } from "../permission/permission.enum";
import { User } from "../user/user.class";
import { IUser } from "../user/user.interface";
import { Visitor } from "../visitor/visitor.class";
import { IVisitor } from "../visitor/visitor.interface";
import { TaskStatus } from "../workflow/task-status.enum";
import { TaskType } from "../workflow/task-type.enum";
import { ITask } from "../workflow/task.interface";
import { IRequestTask } from "./request-task.interface";
import { Request } from "./request.class";
import { CarType, IRequest } from "./request.interface";

describe('Request', () => {

    let user = <IUser>null;
    let visitor = <IVisitor>null;
    let organizationWithoutWorkflow = <IOrganization>null;
    let organization = <IOrganization>null;
    let request = <IRequest>null;

    beforeEach(done => {
        User.createUser('Ron', 'Borysovski', '123456', 'roni537@gmail.com').then((usr: IUser) => {
            expect(usr).to.exist;
            user = usr;

            return Visitor.createVisitor(<IVisitor>{
                name: 'John Doe',
                company: 'Company',
                _id: 'jdc'
            });
        }).then((vsr: IVisitor) => {
            expect(vsr).to.exist;
            visitor = vsr;

            return Organization.createOrganization('organizationWithoutWorkflow');
        }).then((org: IOrganization) => {
            expect(org).to.exist;
            organizationWithoutWorkflow = org;

            return Organization.createOrganization('organization');
        }).then((org: IOrganization) => {
            expect(org).to.exist;

            let workflow = [
                { order: 1, type: TaskType.HUMAN, organization: organizationWithoutWorkflow },
                { order: 2, type: TaskType.CAR, organization: organizationWithoutWorkflow },
                { order: 3, type: TaskType.HUMAN, organization: org },
                { order: 4, type: TaskType.CAR, organization: org }
            ];

            return Organization.setWorkflow(org._id, workflow);
        }).then((org: IOrganization) => {
            expect(org).to.exist;
            organization = org;

            return Request.createRequest(new Date(), new Date(), visitor, user, 'desc', CarType.PRIVATE, '123456', organization, 'SOLDIER');
        }).then((req: IRequest) => {
            expect(req).to.exist;

            request = req;
            done();
        });
    })

    describe('#createRequest', () => {
        it('Should throw an error when missing request data', done => {
            Request.createRequest(null, null, null, null, null, null, null, null, null).catch(err => {
                expect(err).to.exist
                    .and.have.property('name', 'ValidationError');

                done();
            })
        });

        it('Should throw an error when requestor not found', done => {

            let requestor = <IUser>{
                firstName: 'Test',
                lastName: 'User',
                _id: 'UnsavedUser'
            };

            Request.createRequest(new Date(), new Date(), visitor, requestor, 'desc', CarType.NONE, null, organization, 'SOLDIER').catch(err => {
                expect(err).to.exist
                    .and.have.property('name', 'ValidationError');

                done();
            });
        });

        it('Should throw an error when organization not found', done => {
            let org = <IOrganization>{
                _id: new Types.ObjectId(),
                name: 'org',
                workflow: []
            };

            Request.createRequest(new Date(), new Date(), visitor, user, 'desc', CarType.NONE, null, org, 'SOLDIER').catch(err => {
                expect(err).to.exist
                    .and.have.property('name', 'ValidationError');

                done();
            });
        });

        it('Should throw an error when request is valid but organization does not have workflow', done => {
            Request.createRequest(new Date(), new Date(), visitor, user, 'desc', CarType.NONE, null, organizationWithoutWorkflow, 'SOLDIER').catch(err => {
                expect(err).to.exist;
                expect(err).to.have.property('message', 'Cannot save request because workflow not assigned to organization yet');

                done();
            });
        });

        it('Should create a request', done => {
            let date = new Date();
            Request.createRequest(date, date, visitor, user, 'desc', CarType.PRIVATE, '1234', organization, 'SOLDIER').then((request: IRequest) => {
                expect(request).to.exist;
                expect(request).to.have.property('_id');
                expect(request).to.have.property('organization').which.has.property('name', 'organization');
                expect(request).to.have.property('visitor').which.has.property('name', 'John Doe');
                expect(request).to.have.property('isSoldier', true);
                expect(request).to.have.property('requestor').which.has.property('firstName', 'Ron')
                expect(request).to.have.property('requestor').which.has.property('lastName', 'Borysovski');
                expect(request).to.have.property('requestor').which.has.property('mail', 'roni537@gmail.com');
                expect(request).to.have.property('comments').to.be.an('array').with.length(0);
                expect(request).to.have.property('startDate', date);
                expect(request).to.have.property('endDate', date);
                expect(request).to.have.property('description', 'desc');
                expect(request).to.have.property('workflow').that.is.an('array').and.has.length(4);

                done();
            })
        });

        it('Should create visitor if not exists and then create the request', done => {
            let unsavedVisitor = <IVisitor>{
                name: 'Unsaved visitor',
                company: 'Unemployeed',
                _id: 'Unsaved'
            };

            Request.createRequest(new Date(), new Date(), unsavedVisitor, user, 'desc', CarType.NONE, null, organization, 'SOLDIER').then((request: IRequest) => {
                expect(request).to.exist;
                expect(request).to.have.property('visitor').which.has.property('name', 'Unsaved visitor');

                return Visitor.findVisitor('Unsaved');
            }).then((visitor: IVisitor) => {
                expect(visitor).to.exist;
                expect(visitor).to.have.property('name', 'Unsaved visitor');
                expect(visitor).to.have.property('company', 'Unemployeed');

                done();
            });
        });

        it('Should create request without CAR tasks in workflow when car is not required', done => {
            let date = new Date();
            Request.createRequest(date, date, visitor, user, 'desc', CarType.NONE, null, organization, 'SOLDIER').then((request: IRequest) => {
                expect(request).to.exist;
                expect(request).to.have.property('_id');
                expect(request).to.have.property('organization').which.has.property('name', 'organization');
                expect(request).to.have.property('visitor').which.has.property('name', 'John Doe');
                expect(request).to.have.property('requestor').which.has.property('firstName', 'Ron')
                expect(request).to.have.property('requestor').which.has.property('lastName', 'Borysovski');
                expect(request).to.have.property('requestor').which.has.property('mail', 'roni537@gmail.com');
                expect(request).to.have.property('startDate', date);
                expect(request).to.have.property('endDate', date);
                expect(request).to.have.property('description', 'desc');
                expect(request).to.have.property('workflow').that.is.an('array').and.has.length(2).and.satisfies(workflow => {
                    workflow.forEach(task => {
                        expect(task).to.have.property('type', TaskType.HUMAN);
                    })

                    return true;
                });

                done();
            })
        })
    });

    describe('#findRequest', () => {
        it('Should return null when request not exists', done => {
            Promise.all([
                Request.findRequest(new Types.ObjectId()),
                Request.findRequest(null)
            ]).then(values => {
                expect(values).to.exist.and.to.satisfy((values: IRequest[]) => {
                    values.forEach(request => expect(request).to.not.exist);

                    return true;
                });

                done();
            })
        });

        it('Should return request when exists with all populated data', done => {
            Request.findRequest(request._id).then((fetchedRequest: IRequest) => {
                expect(fetchedRequest).to.exist;
                expect(fetchedRequest).to.have.property('visitor').which.has.property('name', 'John Doe');
                expect(fetchedRequest).to.have.property('requestor').that.satisfy(requestor => {
                    expect(requestor).to.exist;
                    expect(requestor).to.have.property('firstName', 'Ron');
                    expect(requestor).to.have.property('lastName', 'Borysovski');
                    expect(requestor).to.have.property('mail', 'roni537@gmail.com');
                    expect(requestor).to.have.property('permissions', undefined);
                    expect(requestor).to.have.property('organization', undefined);
                    expect(requestor).to.have.property('isAdmin', undefined);

                    return true;
                });

                expect(fetchedRequest).to.have.property('organization').that.satisfy(organization => {
                    expect(organization).to.have.property('name', 'organization');
                    expect(organization).to.have.property('_id');
                    expect(organization).to.have.property('workflow', undefined);

                    return true;
                });

                expect(fetchedRequest).to.have.property('workflow').that.satisfies((workflow: IRequestTask[]) => {
                    expect(workflow).to.be.an('array').and.to.have.length(4);
                    workflow.forEach((task: IRequestTask) => {
                        expect(task).to.have.property('order');
                        expect(task).to.have.property('status', TaskStatus.PENDING);
                        expect(task).to.have.property('organization');
                    });

                    return true;
                });

                done();
            })
        })
    });

    describe('#updateRequest', () => {
        it('Should return null when request not exists', done => {
            Request.updateRequest(<IRequest>{ _id: new Types.ObjectId() }).then(req => {
                expect(req).to.not.exist;

                done();
            });
        });

        it('Should update request without changing critic fields (workflow, organization, etc..)', done => {
            request.description = 'Test description';
            request.phoneNumber = '*#06#';
            request.needEscort = true;
            request.workflow = [];

            Request.updateRequest(request).then((req: IRequest) => {
                expect(req).to.exist;
                expect(req).to.have.property('description', 'Test description');
                expect(req).to.have.property('phoneNumber', '*#06#');
                expect(req).to.have.property('needEscort', true);
                expect(req).to.have.property('workflow').to.be.an('array').with.length(4);

                done();
            });
        });
    });

    describe('#deleteRequest', () => {
        it('Should do nothing when request not exists', done => {
            Request.deleteRequest(new Types.ObjectId()).then(() => {
                return Request.findRequest(request._id);
            }).then(req => {
                expect(req).to.exist;

                done();
            });
        });

        it('Should delete request', done => {
            Request.deleteRequest(request._id).then(() => {
                return Request.findRequest(request._id);
            }).then(req => {
                expect(req).to.not.exist;

                done();
            });
        });
    });

    describe('#searchMyRequests', () => {
        let anotherUser = <IUser>null;
        beforeEach(done => {
            User.createUser('Another', 'User', '22222', 'mail').then((usr: IUser) => {
                expect(usr).to.exist;
                anotherUser = usr;

                return Promise.all([
                    Request.createRequest(new Date(), new Date(), visitor, user, 'desc', CarType.ARMY, '1111', organization, 'SOLDIER'),
                    Request.createRequest(new Date(), new Date(), visitor, user, 'desc', CarType.ARMY, '2222', organization, 'SOLDIER'),
                    Request.createRequest(new Date(), new Date(), <IVisitor>{ _id: '111111', name: 'aaaaa' }, user, 'desc', CarType.NONE, null, organization, 'SOLDIER'),
                    Request.createRequest(new Date(), new Date(), <IVisitor>{ _id: '222222', name: 'bbbbbb' }, user, 'desc', CarType.NONE, null, organization, 'SOLDIER'),
                    Request.createRequest(new Date(), new Date(), <IVisitor>{ _id: '121212', name: 'ababab' }, user, 'desc', CarType.NONE, null, organization, 'SOLDIER'),
                ]);
            }).then(() => {
                done();
            });
        });

        it('Should return empty collection when no user provided', done => {
            Request.searchMyRequests(null).then((collection: ICollection<IRequest>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 0);
                expect(collection).to.have.property('set')
                    .which.is.an('array')
                    .and.has.length(0);

                done();
            })
        });

        it('Should return empty collection when user not exists on database', done => {
            let unsavedUser = <IUser>{
                _id: 'UnsavedUser',
                firstName: 'Unsaved',
                lastName: 'User',
                mail: 'No mail'
            };

            Request.searchMyRequests(unsavedUser).then((collection: ICollection<IRequest>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 0);
                expect(collection).to.have.property('set')
                    .which.is.an('array')
                    .and.has.length(0);

                done();
            })
        });

        it('Should return empty collection if requested user doesn\'t have any requests', done => {
            Request.searchMyRequests(anotherUser).then((collection: ICollection<IRequest>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 0);
                expect(collection).to.have.property('set')
                    .which.is.an('array')
                    .and.has.length(0);

                done();
            })
        });

        it('Should return collection with all user\'s requests if no search term is provided', done => {
            Request.searchMyRequests(user).then((collection: ICollection<IRequest>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 6);
                expect(collection).to.have.property('set').which.is.an('array').with.length(6);

                done();
            });
        });

        it('Should return collection with user\'s requests filtered by search term', done => {
            Promise.all(['11111', '222', '1212', 'aaa', 'bbbbb', 'bab']
                .map(searchTerm => Request.searchMyRequests(user, searchTerm)))
                .then((values: ICollection<IRequest>[]) => {
                    expect(values).to.exist;
                    expect(values).to.be.an('array').with.length(6);

                    values.forEach(value => {
                        expect(value).to.exist;
                        expect(value).to.have.property('totalCount', 1);
                        expect(value).to.have.property('set').which.is.an('array').with.length(1);
                    });

                    return Promise.all(['1', '2', 'a', 'b'].map(searchTerm => Request.searchMyRequests(user, searchTerm)));
                }).then((values: ICollection<IRequest>[]) => {
                    expect(values).to.exist;
                    expect(values).to.be.an('array').with.length(4);

                    values.forEach(value => {
                        expect(value).to.exist;
                        expect(value).to.have.property('totalCount', 2);
                        expect(value).to.have.property('set').which.is.an('array').with.length(2);
                    });

                    return Promise.all(['jdc', 'Jo', 'John', 'john', 'john ', 'Doe', 'Do', 'D', 'd', 'e', 'o', 'doe', 'do', 'oe', 'hn'].map(searchTerm => Request.searchMyRequests(user, searchTerm)));
                }).then((values: ICollection<IRequest>[]) => {
                    expect(values).to.exist;
                    expect(values).to.be.an('array').with.length(15);

                    values.forEach(value => {
                        expect(value).to.exist;
                        expect(value).to.have.property('totalCount', 3);
                        expect(value).to.have.property('set').which.is.an('array').with.length(3);
                    });

                    done();
                });
        });
    })

    describe('#searchAllRequests', () => {
        let organization1 = <IOrganization>null;
        let organization2 = <IOrganization>null
        let organization3 = <IOrganization>null
        let organization4 = <IOrganization>null
        let user1 = <IUser>null;
        let user2 = <IUser>null;
        let user3 = <IUser>null;
        let user4 = <IUser>null;


        beforeEach(done => {
            Promise.all(
                ['org1all', 'org2all', 'org3all', 'org4all']
                    .map(name => Organization.createOrganization(name)))
                .then((values: IOrganization[]) => {
                    expect(values).to.exist
                        .and.to.be.an('array')
                        .with.length(4);

                    organization1 = values[0];
                    organization2 = values[1];
                    organization3 = values[2];
                    organization4 = values[3];

                    return Promise.all(['user1', 'user2', 'user3', 'user4']
                        .map(id => User.createUser('name', 'last', id, id)));
                }).then((values: IUser[]) => {
                    expect(values).to.exist
                        .and.to.be.an('array')
                        .with.length(4);

                    user1 = values[0];
                    user2 = values[1];
                    user3 = values[2];
                    user4 = values[3];

                    return Promise.all([
                        User.setOrganization(user1._id, organization1._id),
                        User.setOrganization(user2._id, organization2._id),
                        User.setOrganization(user3._id, organization3._id),
                        User.setOrganization(user4._id, organization4._id),
                    ]);
                }).then((values) => {
                    expect(values).to.exist
                        .and.to.be.an('array')
                        .with.length(4);

                    user1 = <IUser>values[0];
                    user2 = <IUser>values[1];
                    user3 = <IUser>values[2];
                    user4 = <IUser>values[3];


                    let workflowForOrg3 = [
                        <ITask>{
                            organization: organization1,
                            type: TaskType.HUMAN,
                            order: 1
                        },
                        <ITask>{
                            organization: organization2,
                            type: TaskType.HUMAN,
                            order: 2
                        },
                        <ITask>{
                            organization: organization3,
                            type: TaskType.HUMAN,
                            order: 3
                        },
                    ];

                    let workflowForOrg2 = [
                        <ITask>{
                            organization: organization1,
                            type: TaskType.HUMAN,
                            order: 1
                        },
                        <ITask>{
                            organization: organization2,
                            type: TaskType.HUMAN,
                            order: 2
                        }
                    ];

                    let workflowForOrg1 = [
                        <ITask>{
                            organization: organization1,
                            type: TaskType.HUMAN,
                            order: 1
                        },
                    ];

                    let workflowForOrg4 = [
                        <ITask>{
                            organization: organization2,
                            type: TaskType.HUMAN,
                            order: 1
                        },
                        <ITask>{
                            organization: organization4,
                            type: TaskType.HUMAN,
                            order: 2
                        },
                    ];

                    return Promise.all([
                        Organization.setWorkflow(organization1._id, workflowForOrg1),
                        Organization.setWorkflow(organization2._id, workflowForOrg2),
                        Organization.setWorkflow(organization3._id, workflowForOrg3),
                        Organization.setWorkflow(organization4._id, workflowForOrg4),
                    ]);
                }).then((values) => {
                    expect(values).to.exist
                        .and.to.be.an('array')
                        .with.length(4);

                    organization1 = <IOrganization>values[0];
                    organization2 = <IOrganization>values[1];
                    organization3 = <IOrganization>values[2];
                    organization4 = <IOrganization>values[3];


                    return Promise.all([
                        Request.createRequest(new Date(), new Date(), <IVisitor>{ _id: '1234560', name: 'name1', company: 'comp' }, user1, 'desc', CarType.NONE, null, organization1, 'SOLDIER'),
                        Request.createRequest(new Date(), new Date(), <IVisitor>{ _id: '1234561', name: 'name2', company: 'comp' }, user2, 'desc', CarType.NONE, null, organization2, 'SOLDIER'),
                        Request.createRequest(new Date(), new Date(), <IVisitor>{ _id: '1234562', name: 'name3', company: 'comp' }, user3, 'desc', CarType.NONE, null, organization3, 'SOLDIER'),
                        Request.createRequest(new Date(), new Date(), <IVisitor>{ _id: '1234563', name: 'name4', company: 'comp' }, user4, 'desc', CarType.NONE, null, organization4, 'SOLDIER'),
                    ]);
                }).then(() => {
                    done();
                });
        });

        it('Should return null when no user provided', done => {
            Request.searchAllRequests(null).then(collection => {
                expect(collection).to.not.exist;

                done();
            });
        })

        it('Should return null when user not exists on database', done => {
            Request.searchAllRequests(<IUser>{ _id: '11223344', firstName: 'name', lastName: 'last', mail: 'mail' }).then(collection => {
                expect(collection).to.not.exist;

                done();
            });
        });

        it('Should return null when user is not associated to any organization', done => {
            User.createUser('a', 'b', 'c', 'd').then((user: IUser) => {
                return Request.searchAllRequests(user);
            }).then(collection => {
                expect(collection).to.not.exist;

                done();
            });
        });

        it('Should return collection with all requests specific for user (by organization\'s tags)', done => {
            Promise.all([
                Request.searchAllRequests(user1),
                Request.searchAllRequests(user2),
                Request.searchAllRequests(user3),
                Request.searchAllRequests(user4),
            ]).then(values => {
                expect(values).to.exist
                    .and.to.be.an('array')
                    .with.length(4)
                    .and.to.satisfy((values: ICollection<IRequest>) => {
                        expect(values[0]).to.have.property('totalCount', 3);
                        expect(values[0]).to.have.property('set').which.is.an('array').with.length(3).that.satisfies((set: IRequest[]) => {
                            let organizations = set.map(req => req.organization._id.toHexString());
                            let expectedOrganizations = [organization1._id.toHexString(), organization2._id.toHexString(), organization3._id.toHexString()];

                            expect(organizations).to.contain.members(expectedOrganizations);

                            return true;
                        });

                        expect(values[1]).to.have.property('totalCount', 3);
                        expect(values[1]).to.have.property('set').which.is.an('array').with.length(3).that.satisfies((set: IRequest[]) => {
                            let organizations = set.map(req => req.organization._id.toHexString());
                            let expectedOrganizations = [organization2._id.toHexString(), organization3._id.toHexString(), organization4._id.toHexString()];

                            expect(organizations).to.contain.members(expectedOrganizations);

                            return true;
                        });

                        expect(values[2]).to.have.property('totalCount', 1);
                        expect(values[2]).to.have.property('set').which.is.an('array').with.length(1).that.satisfies((set: IRequest[]) => {
                            let organizations = set.map(req => req.organization._id.toHexString());
                            let expectedOrganizations = [organization3._id.toHexString()];

                            expect(organizations).to.contain.members(expectedOrganizations);

                            return true;
                        });

                        expect(values[3]).to.have.property('totalCount', 1);
                        expect(values[3]).to.have.property('set').which.is.an('array').with.length(1).that.satisfies((set: IRequest[]) => {
                            let organizations = set.map(req => req.organization._id.toHexString());
                            let expectedOrganizations = [organization4._id.toHexString()];

                            expect(organizations).to.contain.members(expectedOrganizations);

                            return true;
                        });

                        return true;
                    });

                done();

            });
        });

    });

    describe('#searchPendingRequests', () => {

        let organization1 = <IOrganization>null;
        let organization2 = <IOrganization>null;
        let testerUser = <IUser>null;

        beforeEach(done => {
            Organization.createOrganization('org1pending').then((org: IOrganization) => {
                expect(org).to.exist;
                organization1 = org;

                return Organization.createOrganization('org2pending');
            }).then((org: IOrganization) => {
                expect(org).to.exist;
                organization2 = org;

                let workflow: ITask[] = [
                    <ITask>{
                        organization: organization1,
                        type: TaskType.HUMAN
                    },
                    <ITask>{
                        organization: organization2,
                        type: TaskType.HUMAN
                    },
                ];

                return Organization.setWorkflow(organization1._id, workflow);
            }).then((org: IOrganization) => {
                expect(org).to.exist;
                organization1 = org;

                return User.createUser('tester', 'user', 'tester@user', 'mail');
            }).then((usr: IUser) => {
                expect(usr).to.exist;

                return User.setPermissions('tester@user', organization2._id, [PermissionType.APPROVE_SOLDIER]);
            }).then((usr: IUser) => {
                expect(usr).to.exist;
                testerUser = usr;

                return Promise.all([
                    Request.createRequest(new Date(), new Date(), <IVisitor>{ _id: '1234567', name: 'Soldier', company: 'ay' }, user, 'desc', CarType.NONE, null, organization1, 'SOLDIER'),
                    Request.createRequest(new Date(), new Date(), <IVisitor>{ _id: '123456789', name: 'Civilian', company: 'Company' }, user, 'desc', CarType.NONE, null, organization1, 'SOLDIER'),
                ]);
            }).then(() => {
                done();
            });
        });

        it('Should return empty collection when no user provided', done => {
            Request.searchPendingRequests(null).then(collection => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 0);
                expect(collection).to.have.property('set').to.be.an('array').with.length(0);

                done();
            })
        });

        it('Should return empty collection when user doesn\'t have any permissions', done => {
            User.createUser('no', 'permissions', 'no@permissions', 'm').then((user: IUser) => {
                expect(user).to.exist;
                return Request.searchPendingRequests(user);
            }).then(collection => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 0);
                expect(collection).to.have.property('set').to.be.an('array').with.length(0);

                done();
            });
        });

        it('Should return all pending requests permitted for user', done => {
            Request.searchPendingRequests(testerUser).then(collection => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 1);
                expect(collection).to.have.property('set').to.be.an('array').with.length(1).that.satisfies(set => {
                    expect(set[0]).to.have.property('isSoldier', true);

                    return true;
                });

                done();
            })
        });
    })

    describe('#searchCivilianRequests', () => {
        beforeEach(done => {
            Promise.all([
                Request.createRequest(new Date(), new Date(), visitor, user, 'desc', CarType.ARMY, '1111', organization, 'SOLDIER'),
                Request.createRequest(new Date(), new Date(), visitor, user, 'desc', CarType.ARMY, '2222', organization, 'SOLDIER'),
                Request.createRequest(new Date(), new Date(), <IVisitor>{ _id: '11111111', name: 'aaaaa' }, user, 'desc', CarType.NONE, null, organization, 'SOLDIER'),
                Request.createRequest(new Date(), new Date(), <IVisitor>{ _id: '22222222', name: 'bbbbbb' }, user, 'desc', CarType.NONE, null, organization, 'SOLDIER'),
                Request.createRequest(new Date(), new Date(), <IVisitor>{ _id: '121211', name: 'ababab' }, user, 'desc', CarType.NONE, null, organization, 'SOLDIER'),
            ]).then(() => done());
        });

        it('Should return empty collection when no request satisfies search term', done => {
            Request.searchCivilianRequests(user, 'noMatchingResults').then(collection => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 0);
                expect(collection).to.have.property('set').to.be.an('array').with.length(0);

                done();
            });
        });

        it('Should return all requests for civilian when no search term provided', done => {
            Request.searchCivilianRequests(user, null).then(collection => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 2);
                expect(collection).to.have.property('set').to.be.an('array').with.length(2).that.satisfies(set => {

                    set.forEach(request => {
                        expect(request).to.have.property('isSoldier', false)
                    });
                    return true;
                });

                done();
            });
        });

        it('Should return requests for civilian filtered by search term', done => {
            Promise.all(['1111', '22'].map(searchTerm => Request.searchCivilianRequests(user, searchTerm))).then(values => {
                expect(values).to.satisfy(collections => {
                    collections.forEach(collection => {
                        expect(collection).to.have.property('totalCount', 1);
                        expect(collection).to.have.property('set').which.is.an('array').with.length(1).that.satisfies(set => {
                            set.forEach(request => {
                                expect(request).to.have.property('isSoldier', false);
                            })

                            return true;
                        });
                    });
                    return true;
                })
                done();
            });
        });
    });

    describe('#searchSoldierRequests', () => {
        beforeEach(done => {
            Promise.all([
                Request.createRequest(new Date(), new Date(), visitor, user, 'desc', CarType.ARMY, '1111', organization, 'SOLDIER'),
                Request.createRequest(new Date(), new Date(), visitor, user, 'desc', CarType.ARMY, '2222', organization, 'SOLDIER'),
                Request.createRequest(new Date(), new Date(), <IVisitor>{ _id: '11111111', name: 'aaaaa' }, user, 'desc', CarType.NONE, null, organization, 'SOLDIER'),
                Request.createRequest(new Date(), new Date(), <IVisitor>{ _id: '22222222', name: 'bbbbbb' }, user, 'desc', CarType.NONE, null, organization, 'SOLDIER'),
                Request.createRequest(new Date(), new Date(), <IVisitor>{ _id: '121211', name: 'ababab' }, user, 'desc', CarType.NONE, null, organization, 'SOLDIER'),
            ]).then(() => done());
        });

        it('Should return empty collection when no request satisfies search term', done => {
            Request.searchSoldierRequests(user, 'noMatchingResults').then(collection => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 0);
                expect(collection).to.have.property('set').to.be.an('array').with.length(0);

                done();
            });
        });

        it('Should return all requests for soldier when no search term provided', done => {
            Request.searchSoldierRequests(user, null).then(collection => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 4);
                expect(collection).to.have.property('set').to.be.an('array').with.length(4).that.satisfies(set => {

                    set.forEach(request => {
                        expect(request).to.have.property('isSoldier', true)
                    });
                    return true;
                });

                done();
            });
        });

        it('Should return requests for soldier filtered by search term', done => {
            Promise.all(['121', 'jd'].map(searchTerm => Request.searchSoldierRequests(user, searchTerm))).then(values => {
                expect(values).to.satisfy(collections => {
                    collections.forEach(collection => {
                        expect(collection).to.have.property('set').which.is.an('array').that.satisfies(set => {
                            set.forEach(request => {
                                expect(request).to.have.property('isSoldier', true);
                            })

                            return true;
                        });
                    });
                    return true;
                })
                done();
            });
        });
    });

    describe('#changeTaskStatus', () => {
        it('Should return null when task not found', done => {
            Request.changeTaskStatus(null, new Types.ObjectId(), TaskStatus.APPROVED).then((request: IRequest) => {
                expect(request).to.not.exist;

                done();
            });
        });

        it('Should change task status', done => {
            Request.changeTaskStatus(user._id, request.workflow[0]._id, TaskStatus.APPROVED).then((request: IRequest) => {
                expect(request).to.exist;
                expect(request).to.have.property('workflow').which.is.an('array').with.length(4).that.satisfies(workflow => {
                    expect(workflow[0]).to.have.property('status', TaskStatus.APPROVED);
                    expect(workflow[0]).to.have.property('lastChangeDate').which.is.a('date');
                    expect(workflow[0]).to.have.property('authorizer').that.have.property('_id', user._id);

                    return true;
                });

                done();
            });
        });

        it('Should change whole request status', done => {
            Request.changeTaskStatus(user._id, request.workflow[0]._id, TaskStatus.DENIED).then((request: IRequest) => {
                expect(request).to.exist;
                expect(request).to.have.property('status', TaskStatus.DENIED);

                done();
            });
        });
    });
});