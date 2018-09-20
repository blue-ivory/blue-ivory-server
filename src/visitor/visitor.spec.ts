import { expect } from 'chai';
import { Visitor } from './visitor.class';
import { IVisitor } from './visitor.interface';

describe('Visitor', () => {
    describe('#createVisitor', () => {

        it('Should create a visitor', async () => {
            let visitor = <IVisitor>{
                _id: '123456',
                name: 'Ron Borysovski',
                company: 'Classified'
            };

            let newVisitor = await Visitor.createVisitor(visitor);
            expect(newVisitor).to.exist;
            expect(newVisitor).to.have.property('_id', '123456');
            expect(newVisitor).to.have.property('name', 'Ron Borysovski');
            expect(newVisitor).to.have.property('company', 'Classified');
        });

        it('Should not create user with duplicate id', async () => {
            let firstVisitor = <IVisitor>{
                _id: '123456',
                name: 'Ron Borysovski',
                company: 'Classified'
            };

            let secondVisitor = <IVisitor>{
                _id: firstVisitor._id,
                name: 'John Doe',
                company: 'Unemployeed'
            };

            try {
                let firstCreatedVisitor = await Visitor.createVisitor(firstVisitor);
                expect(firstCreatedVisitor).to.exist;
                await Visitor.createVisitor(secondVisitor);
            } catch (err) {
                expect(err).to.exist;
                expect(err).to.have.property('code', 11000);
            }
        });

        it('Should throw error when missing visitor fields', async () => {
            let visitor = <IVisitor>{
                _id: '123456'
            };

            try {
                await Visitor.createVisitor(visitor);
            } catch (err) {
                expect(err).to.exist;
                expect(err).to.have.property('name', 'ValidationError');
            }
        });
    });

    describe('#findVisitor', () => {
        it('Should return null if visitor not exists', async () => {
            let visitor = await Visitor.findVisitor('123456');
            expect(visitor).to.not.exist;
        });

        it('Should return visitor', async () => {
            let visitor = <IVisitor>{
                _id: '123456',
                name: 'Ron Borysovski',
                company: 'Classified'
            };

            await Visitor.createVisitor(visitor);
            let foundVisitor = await Visitor.findVisitor('123456');
            expect(foundVisitor).to.exist;
            expect(foundVisitor).to.have.property('_id', '123456');
            expect(foundVisitor).to.have.property('name', 'Ron Borysovski');
        });
    });

    describe('#findOrCreateVisitor', () => {
        it('Should create visitor if not exists', async () => {
            let visitor = <IVisitor>{
                _id: '123456',
                name: 'Ron Borysovski',
                company: 'Classified'
            };

            let _visitor = await Visitor.findOrCreateVisitor(visitor);
            expect(_visitor).to.exist;
            expect(_visitor).to.have.property('_id', '123456');
            expect(_visitor).to.have.property('name', 'Ron Borysovski');
            expect(_visitor).to.have.property('company', 'Classified');
        });

        it('Should return visitor if already exists', async () => {
            let visitorToCreate = <IVisitor>{
                _id: '123456',
                name: 'Ron Borysovski',
                company: 'Classified'
            };

            await Visitor.createVisitor(visitorToCreate);
            let visitor = await Visitor.findOrCreateVisitor(<IVisitor>{ _id: '123456' });
            expect(visitor).to.exist;
            expect(visitor).to.have.property('_id', '123456');
            expect(visitor).to.have.property('name', 'Ron Borysovski');
            expect(visitor).to.have.property('company', 'Classified');
        });

        it('Should return null when visitor is not provided', async () => {
            let visitor = await Visitor.findOrCreateVisitor(null);
            expect(visitor).to.not.exist;
        });
    });

    describe('#searchVisitors', () => {

        beforeEach(async () => {
            let visitor1 = <IVisitor>{ _id: '123456', name: 'Ron Borysovski', company: 'Classified' };
            let visitor2 = <IVisitor>{ _id: '1456789', name: 'John Doe', company: 'Unemployeed' };
            let visitor3 = <IVisitor>{ _id: '78910', name: 'Testing Person', company: 'QA' };

            await Promise.all([
                Visitor.createVisitor(visitor1),
                Visitor.createVisitor(visitor2),
                Visitor.createVisitor(visitor3)
            ]);
        });

        it('Should return empty collection when visitors not found', async () => {
            let collection = await Visitor.searchVisitors('NotExistingVisitor');
            expect(collection).to.exist;
            expect(collection).to.have.property('totalCount', 0);
            expect(collection).to.have.property('set')
                .which.is.an('array').with.length(0);
        });

        it('Should return visitors searched by name', async () => {
            let oneVisitorPromises = ['ron', 'doe', 'person'].map(name => {
                return Visitor.searchVisitors(name);
            });

            let twoVisitorPromises = ['on', 'e', 'i'].map(name => {
                return Visitor.searchVisitors(name);
            });

            let threeVisitorPromises = ['o', 'n'].map(name => {
                return Visitor.searchVisitors(name);
            });

            let values = [];

            values[0] = await Promise.all(oneVisitorPromises);
            values[1] = await Promise.all(twoVisitorPromises);
            values[2] = await Promise.all(threeVisitorPromises);

            expect(values[0]).to.exist.and.to.be.an('array').with.length(3);
            expect(values[1]).to.exist.and.to.be.an('array').with.length(3);
            expect(values[2]).to.exist.and.to.be.an('array').with.length(2);

            values.forEach((value, index) => {
                value.forEach(collection => {
                    expect(collection).to.exist;
                    expect(collection).to.have.property('totalCount', index + 1);
                })
            })
        });

        it('Should return visitors searched by id', async () => {
            let oneVisitorPromises = ['123', '567', '7891'].map(id => {
                return Visitor.searchVisitors(id);
            });

            let twoVisitorPromises = ['456', '789'].map(id => {
                return Visitor.searchVisitors(id);
            });

            let threeVisitorPromises = ['1'].map(id => {
                return Visitor.searchVisitors(id);
            });

            let values = [];
            values[0] = await Promise.all(oneVisitorPromises);
            values[1] = await Promise.all(twoVisitorPromises);
            values[2] = await Promise.all(threeVisitorPromises);

            expect(values[0]).to.exist.and.to.be.an('array').with.length(3);
            expect(values[1]).to.exist.and.to.be.an('array').with.length(2);
            expect(values[2]).to.exist.and.to.be.an('array').with.length(1);

            values.forEach((value, index) => {
                value.forEach(collection => {
                    expect(collection).to.exist;
                    expect(collection).to.have.property('totalCount', index + 1);
                })
            })
        });

        it('Should return all visitors when no search term provided', async () => {
            let collection = await Visitor.searchVisitors('');
            expect(collection).to.exist;
            expect(collection).to.have.property('totalCount', 3);
            expect(collection).to.have.property('set')
                .which.is.an('array').with.length(3);
        });
    });

    describe('#updateVisitor', () => {
        beforeEach(async () => {
            let visitor1 = <IVisitor>{ _id: '123456', name: 'Ron Borysovski', company: 'Classified' };
            let visitor2 = <IVisitor>{ _id: '1456789', name: 'John Doe', company: 'Unemployeed' };

            await Promise.all([
                Visitor.createVisitor(visitor1),
                Visitor.createVisitor(visitor2),
            ]);
        });

        it('Should throw error when null is passed', async () => {
            try {
                await Visitor.updateVisitor(null);
            } catch (err) {
                expect(err).to.exist;
            }
        })

        it('Should do nothing when visitor not exists', async () => {
            let visitor = await Visitor.updateVisitor(<IVisitor>{ _id: '121', name: 'JJ', company: 'IDK' });
            expect(visitor).to.not.exist;
        })

        it('Should update visitor name', async () => {
            let visitor = await Visitor.updateVisitor(<IVisitor>{ _id: '123456', name: 'New name' });
            expect(visitor).to.exist;
            expect(visitor).to.have.property('name', 'New name');
            expect(visitor).to.has.property('company', 'Classified');
        })

        it('Should update visitor company', async () => {
            let visitor = await Visitor.updateVisitor(<IVisitor>{ _id: '1456789', company: 'Test' });
            expect(visitor).to.exist;
            expect(visitor).to.have.property('name', 'John Doe');
            expect(visitor).to.has.property('company', 'Test');
        })

        it('Should update both name and company', async () => {
            let visitor = await Visitor.updateVisitor(<IVisitor>{ _id: '123456', name: 'RR', company: 'II' });
            expect(visitor).to.exist;
            expect(visitor).to.have.property('name', 'RR');
            expect(visitor).to.have.property('company', 'II');
        })
    })
});