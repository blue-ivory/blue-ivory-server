"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const visitor_manager_1 = require("./../server/managers/visitor.manager");
const visitor_1 = require("./../server/classes/visitor");
const chai_1 = require("chai");
describe('VisitorManager', () => {
    let visitorManager = new visitor_manager_1.VisitorManager();
    describe('#all', () => {
        it('Should return 0 visitors (when not exists)', done => {
            visitorManager.all().then(visitors => {
                chai_1.expect(visitors).to.exist;
                chai_1.expect(visitors).to.be.an('array');
                chai_1.expect(visitors.length).to.eql(0);
                done();
            });
        });
        it('Should return all visitors (when exists)', done => {
            visitorManager.create(new visitor_1.Visitor('v_name1', 'v_company1', '123')).then(v1 => {
                visitorManager.create(new visitor_1.Visitor('v_name2', 'v_company2', '222')).then(v2 => {
                    visitorManager.all().then(visitors => {
                        chai_1.expect(visitors).to.exist;
                        chai_1.expect(visitors).to.be.an('array');
                        chai_1.expect(visitors.length).to.eql(2);
                        let visitorsId = visitors.map(visitor => {
                            return visitor._id;
                        });
                        chai_1.expect(visitorsId).to.have.members([v1._id, v2._id]);
                        done();
                    });
                });
            });
        });
    });
    describe('#create', () => {
        it('Should create a visitor', (done) => {
            let v = new visitor_1.Visitor('v_name', 'v_company', '123456');
            visitorManager.create(v).then(visitor => {
                chai_1.expect(visitor).to.exist;
                chai_1.expect(visitor).to.have.property('name', 'v_name');
                chai_1.expect(visitor).to.have.property('company', 'v_company');
                chai_1.expect(visitor).to.have.property('_id', '123456');
                done();
            });
        });
        it('Should not create user with duplicate id', (done) => {
            let v1 = new visitor_1.Visitor('v_name', 'v_company', '123');
            visitorManager.create(v1).then(visitor => {
                chai_1.expect(visitor).to.exist;
                let v2 = new visitor_1.Visitor('v_name2', 'v_company2', '123');
                visitorManager.create(v2).catch(error => {
                    chai_1.expect(error).to.exist;
                    chai_1.expect(error).to.have.property('code', 11000);
                    done();
                });
            });
        });
    });
    describe('#read', () => {
        it('Should not return visitor (if not exists)', done => {
            visitorManager.read('test').then(visitor => {
                chai_1.expect(visitor).to.not.exist;
                done();
            });
        });
        it('Should return visitor (if exists)', done => {
            let v = new visitor_1.Visitor('v_name', 'v_company', '123');
            visitorManager.create(v).then(visitor => {
                chai_1.expect(visitor).to.exist;
                visitorManager.read('123').then(rVisitor => {
                    chai_1.expect(rVisitor).to.exist;
                    chai_1.expect(rVisitor).to.have.property('_id', '123');
                    done();
                });
            });
        });
    });
    describe('#delete', () => {
        it('Should do nothing (when visitor not exist)', done => {
            visitorManager.delete('123').then(visitor => {
                chai_1.expect(visitor).to.not.exist;
                done();
            });
        });
        it('Should delete visitor (when exits)', done => {
            visitorManager.create(new visitor_1.Visitor('v_name', 'v_company', '123')).then(visitor => {
                chai_1.expect(visitor).to.exist;
                visitorManager.read(visitor._id).then(visitor => {
                    chai_1.expect(visitor).to.exist;
                    visitorManager.delete(visitor._id).then(visitor => {
                        chai_1.expect(visitor).to.exist;
                        visitorManager.read(visitor._id).then(visitor => {
                            chai_1.expect(visitor).to.not.exist;
                            done();
                        });
                    });
                });
            });
        });
    });
    describe('#update', () => {
        it('Should create visitor if not exists', done => {
            let v = new visitor_1.Visitor('v_name', 'v_company', '123');
            visitorManager.update(v).then(visitor => {
                chai_1.expect(visitor).to.exist;
                chai_1.expect(visitor).to.have.property('_id', '123');
                done();
            });
        });
        it('Should update an existing visitor', done => {
            let v = new visitor_1.Visitor('v_name', 'v_company', '123');
            visitorManager.create(v).then(visitor => {
                chai_1.expect(visitor).to.exist;
                visitor.name = 'v_updated_name';
                visitor.company = 'v_updated_company';
                visitorManager.update(visitor).then(updatedVisitor => {
                    chai_1.expect(updatedVisitor).to.exist;
                    chai_1.expect(updatedVisitor).to.have.property('name', 'v_updated_name');
                    chai_1.expect(updatedVisitor).to.have.property('company', 'v_updated_company');
                    done();
                });
            });
        });
    });
    describe('#readOrCreate', () => {
        it('Should create visitor if not exists', done => {
            let v = new visitor_1.Visitor('v_name', 'v_company', '123');
            visitorManager.readOrCreate(v).then(visitor => {
                chai_1.expect(visitor).to.exist;
                chai_1.expect(visitor).to.have.property('_id', '123');
                done();
            });
        });
        it('Should read visitor if exists (and not override it\'s content)', done => {
            let v = new visitor_1.Visitor('v_name', 'v_company', '123');
            visitorManager.create(v).then(visitor => {
                visitor.name = 'v_changed_name';
                visitorManager.readOrCreate(visitor).then(fetchedVisitor => {
                    chai_1.expect(fetchedVisitor).to.exist;
                    chai_1.expect(fetchedVisitor).to.have.property('name', 'v_name');
                    done();
                });
            });
        });
    });
    describe('#search', () => {
        it('Should return no visitors (when not found)', done => {
            visitorManager.search('test').then(visitors => {
                chai_1.expect(visitors).to.be.an('array');
                chai_1.expect(visitors.length).to.eql(0);
                done();
            });
        });
        it('Should return visitors when searched by name', done => {
            visitorManager.create(new visitor_1.Visitor('v_name1', 'v_company1', '123')).then(() => {
                visitorManager.create(new visitor_1.Visitor('v_name2', 'v_company2', '222')).then(() => {
                    visitorManager.search('name1').then(visitors => {
                        chai_1.expect(visitors).to.exist;
                        chai_1.expect(visitors).to.be.an('array');
                        chai_1.expect(visitors.length).to.eql(1);
                        chai_1.expect(visitors[0]).to.have.property('name', 'v_name1');
                        chai_1.expect(visitors[0]).to.have.property('_id', '123');
                        done();
                    });
                });
            });
        });
        it('Should return visitors when searched by id', done => {
            visitorManager.create(new visitor_1.Visitor('v_name1', 'v_company1', '123')).then(() => {
                visitorManager.create(new visitor_1.Visitor('v_name2', 'v_company2', '222')).then(() => {
                    visitorManager.search('22').then(visitors => {
                        chai_1.expect(visitors).to.exist;
                        chai_1.expect(visitors).to.be.an('array');
                        chai_1.expect(visitors.length).to.eql(1);
                        chai_1.expect(visitors[0]).to.have.property('name', 'v_name2');
                        chai_1.expect(visitors[0]).to.have.property('_id', '222');
                        done();
                    });
                });
            });
        });
    });
});
