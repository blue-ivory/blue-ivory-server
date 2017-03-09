/// <reference path="../../typings/index.d.ts" />
import { UserManager } from './../server/managers/user.manager';
import { RequestManager } from './../server/managers/request.manager';
import { OrganizationManager } from './../server/managers/organization.manager';
import { VisitorManager } from './../server/managers/visitor.manager';
import { User } from './../server/classes/user';
import { Request } from './../server/classes/request';
import { Visitor } from './../server/classes/visitor';
import { Organization } from './../server/classes/organization';
import { expect } from 'chai';

describe('RequestManager', () => {
    let userManager: UserManager = new UserManager();
    let requestManager: RequestManager = new RequestManager();
    let organizationManager: OrganizationManager = new OrganizationManager();
    let visitorManager: VisitorManager = new VisitorManager();
    let visitor: Visitor = null;
    let user: User = null;
    let organization: Organization = null;

    beforeEach((done) => {
        visitorManager.create(new Visitor('test_visitor', 'test_company', '102938'))
            .then(v => visitor = v)
            .then(() => userManager.create(new User('fName', 'lName', 'uid', 'mail')))
            .then(u => user = u)
            .then(() => organizationManager.create(new Organization('test')))
            .then(o => {
                organization = o
                done();
            });
    });

    describe('#create', () => {
        it('Should not create a request when missing data', done => {
            organizationManager.create(organization).then(organization => {
                visitorManager.create(visitor).then(visitor => {
                    requestManager.create(new Request(null, null, null, null, null, null, null, null, null)).catch(error => {
                        expect(error).to.exist;
                        expect(error).to.eql('Organization not found');

                        requestManager.create(new Request(null, null, null, null, null, null, null, null, organization)).catch(error => {
                            expect(error).to.exist;
                            expect(error).to.eql('Visitor is a required field');

                            requestManager.create(new Request(null, null, visitor, null, null, null, null, null, organization)).catch(error => {
                                expect(error).to.exist;
                                expect(error).to.have.property('message', 'Request validation failed')

                                done();
                            });
                        });

                    });

                });
            })
        });
        it('Should create a request', done => {
            requestManager.create(new Request(new Date(), new Date(), visitor, user, '', true, true, true, organization)).then(request => {
                expect(request).to.exist;
                expect(request).to.have.property('_id');
                expect(request).to.have.property('visitor');
                expect(request).to.have.property('requestor');
                expect(request).to.have.property('requestDate');
                expect(request).to.have.property('startDate');
                expect(request).to.have.property('endDate');
                expect(request).to.have.property('isSolider', true);
                expect(request).to.have.property('needEscort', true);
                expect(request).to.have.property('hasCar', true);

                done();
            });
        });
    });

    describe('#read', () => {
        it('Should not return request when not exists', done => {
            requestManager.read('000000000000000000000000').then(request => {
                expect(request).to.not.exist;
                done();
            })
        });
        it('Should return request when exists', done => {
            requestManager.create(new Request(new Date(), new Date(), visitor, user, '', true, true, true, organization)).then(request => {
                expect(request).to.exist;
                requestManager.read(request._id).then(foundRequest => {
                    expect(foundRequest).to.exist;
                    expect(foundRequest).to.satisfy(r => {
                        return r._id.equals(request._id);
                    });

                    done();
                });
            });
        });
    });

    describe('#search', () => {
        it('Should return 0 requests when nothing found');
        it('Should return all requests when empty search-term');
        it('Should return all matching requests by search-term');
    });

    describe('#searchByType', () => {
        it('Should return nothing when nothing to return');
        it('Should return requests by type \'my\'');
        it('Should return requests by type \'pending\'');
        it('Should return requests by type \'all\'');
    });

    describe('#update', () => {
        it('Should do nothing when request not exists');
        it('Should throw an error when request is updated with invalid data');
        it('Should update an existsing request');

    });

    describe('#delete', () => {
        it('Should do nothing when request not found');
        it('Should remove request');
    })

});