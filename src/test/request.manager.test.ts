/// <reference path="../../typings/index.d.ts" />
import { UserManager } from './../server/managers/user.manager';
import { RequestManager } from './../server/managers/request.manager';
import { User } from './../server/classes/user';
import { Request } from './../server/classes/request';
import { Visitor } from './../server/classes/visitor';
import { Base } from './../server/classes/base';
import { expect } from 'chai';

describe('RequestManager', () => {
    let userManager: UserManager = new UserManager();
    let requestManager: RequestManager = new RequestManager();
    let visitor: Visitor = new Visitor('test_visitor', 'test_company', '102938');
    let user: User = new User('fName', 'lName', 'uid', 'mail');

    describe('#create', () => {
        it('Should not create a request when missing data', done => {
            let request: Request = new Request(null, null, visitor, null, null, true, true, true);
            requestManager.create(request).catch(error => {
                expect(error).to.exist;
                expect(error).to.have.property('errors');
                // expect(error.errors).to.have.property('base');
                expect(error.errors).to.have.property('requestor');
                expect(error.errors).to.have.property('startDate');
                expect(error.errors).to.have.property('endDate');

                done();
            });
        });
        it('Should create a request');
        // it('Should create a request', done => {
        //     userManager.create(user).then((user: User) => {
        //         requestManager.create(new Request(new Date(), new Date(), visitor, user, 'desc', true, true, true)).then(request => {
        //             expect(request).to.exist;
        //             expect(request).to.have.property('visitor');
        //             expect(request).to.have.property('requestor');
        //             expect(request).to.have.property('startDate');
        //             expect(request).to.have.property('endDate');
        //             expect(request).to.have.property('description', 'desc');
        //             expect(request).to.have.property('hasCar', true);
        //             expect(request).to.have.property('isSoldier', true);
        //             expect(request).to.have.property('needEscort', true);

        //             done();
        //         });
        //     });
        // });
    });

    describe('#all', () => {
        it('Should fetch 0 requests when not exists');
        it('Should return all requests');

    });

    describe('#read', () => {
        it('Should not return request when not exists');
        it('Should return request when exists');
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