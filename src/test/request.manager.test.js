"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_manager_1 = require("./../server/managers/user.manager");
const request_manager_1 = require("./../server/managers/request.manager");
const organization_manager_1 = require("./../server/managers/organization.manager");
const visitor_manager_1 = require("./../server/managers/visitor.manager");
const user_1 = require("./../server/classes/user");
const request_1 = require("./../server/classes/request");
const visitor_1 = require("./../server/classes/visitor");
const organization_1 = require("./../server/classes/organization");
const chai_1 = require("chai");
describe('RequestManager', () => {
    let userManager = new user_manager_1.UserManager();
    let requestManager = new request_manager_1.RequestManager();
    let organizationManager = new organization_manager_1.OrganizationManager();
    let visitorManager = new visitor_manager_1.VisitorManager();
    let visitor = null;
    let user = null;
    let organization = null;
    beforeEach((done) => {
        visitorManager.create(new visitor_1.Visitor('test_visitor', 'test_company', '102938'))
            .then(v => visitor = v)
            .then(() => userManager.create(new user_1.User('fName', 'lName', 'uid', 'mail')))
            .then(u => user = u)
            .then(() => organizationManager.create(new organization_1.Organization('test')))
            .then(o => {
            organization = o;
            done();
        });
    });
    describe('#create', () => {
        it('Should not create a request when missing data', done => {
            organizationManager.create(organization).then(organization => {
                visitorManager.create(visitor).then(visitor => {
                    requestManager.create(new request_1.Request(null, null, null, null, null, null, null, null)).catch(error => {
                        chai_1.expect(error).to.exist;
                        chai_1.expect(error).to.eql('Organization not found');
                        requestManager.create(new request_1.Request(null, null, null, null, null, null, null, organization)).catch(error => {
                            chai_1.expect(error).to.exist;
                            chai_1.expect(error).to.eql('Visitor is a required field');
                            requestManager.create(new request_1.Request(null, null, visitor, null, null, null, null, organization)).catch(error => {
                                chai_1.expect(error).to.exist;
                                chai_1.expect(error).to.have.property('message', 'Request validation failed');
                                done();
                            });
                        });
                    });
                });
            });
        });
        it('Should create a request', done => {
            requestManager.create(new request_1.Request(new Date(), new Date(), visitor, user, '', true, true, organization)).then(request => {
                chai_1.expect(request).to.exist;
                chai_1.expect(request).to.have.property('_id');
                chai_1.expect(request).to.have.property('visitor');
                chai_1.expect(request).to.have.property('requestor');
                chai_1.expect(request).to.have.property('requestDate');
                chai_1.expect(request).to.have.property('startDate');
                chai_1.expect(request).to.have.property('endDate');
                chai_1.expect(request).to.have.property('isSolider', true);
                chai_1.expect(request).to.have.property('needEscort', true);
                done();
            });
        });
    });
    describe('#read', () => {
        it('Should not return request when not exists', done => {
            requestManager.read('000000000000000000000000').then(request => {
                chai_1.expect(request).to.not.exist;
                done();
            });
        });
        it('Should return request when exists', done => {
            requestManager.create(new request_1.Request(new Date(), new Date(), visitor, user, '', true, true, organization)).then(request => {
                chai_1.expect(request).to.exist;
                requestManager.read(request._id).then(foundRequest => {
                    chai_1.expect(foundRequest).to.exist;
                    chai_1.expect(foundRequest).to.satisfy(r => {
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
    });
});
