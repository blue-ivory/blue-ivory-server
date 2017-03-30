import { IUser } from "../user/user.interface";
import { IVisitor } from "../visitor/visitor.interface";
import { IOrganization } from "../organization/organization.interface";
import { User } from "../user/user.class";
import { expect } from 'chai';
import { Visitor } from "../visitor/visitor.class";
import { Request } from "./request.class";
import { Organization } from "../organization/organization.class";
import { CarType, IRequest } from "./request.interface";
import { Types } from 'mongoose';
import { TaskType } from "../workflow/task-type.enum";
import { TaskStatus } from "../workflow/task-status.enum";
import { IRequestTask } from "./request-task.interface";
import { ICollection } from "../helpers/collection";

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

            return Request.createRequest(new Date(), new Date(), visitor, user, 'desc', CarType.NONE, null, organization);
        }).then((req: IRequest) => {
            expect(req).to.exist;

            request = req;
            done();
        });
    })

    describe('#createRequest', () => {
        it('Should throw an error when missing request data', done => {
            Request.createRequest(null, null, null, null, null, null, null, null).catch(err => {
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

            Request.createRequest(new Date(), new Date(), visitor, requestor, 'desc', CarType.NONE, null, organization).catch(err => {
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

            Request.createRequest(new Date(), new Date(), visitor, user, 'desc', CarType.NONE, null, org).catch(err => {
                expect(err).to.exist
                    .and.have.property('name', 'ValidationError');

                done();
            });
        });

        it('Should throw an error when request is valid but organization does not have workflow', done => {
            Request.createRequest(new Date(), new Date(), visitor, user, 'desc', CarType.NONE, null, organizationWithoutWorkflow).catch(err => {
                expect(err).to.exist;
                expect(err).to.have.property('message', 'Cannot save request because workflow not assigned to organization yet');

                done();
            });
        });

        it('Should create a request', done => {
            let date = new Date();
            Request.createRequest(date, date, visitor, user, 'desc', CarType.NONE, null, organization).then((request: IRequest) => {
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

            Request.createRequest(new Date(), new Date(), unsavedVisitor, user, 'desc', CarType.NONE, null, organization).then((request: IRequest) => {
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

        it('Should update request', done => {
            request.description = 'Test description';
            request.phoneNumber = '*#06#';
            request.needEscort = true;

            Request.updateRequest(request).then((req: IRequest) => {
                expect(req).to.exist;
                expect(req).to.have.property('description', 'Test description');
                expect(req).to.have.property('phoneNumber', '*#06#');
                expect(req).to.have.property('needEscort', true);

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
        
        it('Should throw an error when user not exists');
        it('Should return empty collection if requested user doesn\'t have any requests');
        it('Should return collection with all user\'s requests if no search term is provided');
        it('Should return collection with user\'s requests filtered by search term');
    })
});