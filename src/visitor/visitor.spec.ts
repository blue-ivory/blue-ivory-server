import { ICollection } from './../helpers/collection';
import { expect } from 'chai';
import { IVisitor } from './visitor.interface';
import { Visitor } from './visitor.class';
describe('Visitor', () => {
    describe('#createVisitor', () => {

        it('Should create a visitor', done => {
            let visitor = <IVisitor>{
                _id: '123456',
                name: 'Ron Borysovski',
                company: 'Classified'
            };

            Visitor.createVisitor(visitor).then((visitor: IVisitor) => {
                expect(visitor).to.exist;
                expect(visitor).to.have.property('_id', '123456');
                expect(visitor).to.have.property('name', 'Ron Borysovski');
                expect(visitor).to.have.property('company', 'Classified');

                done();
            });
        });

        it('Should not create user with duplicate id', done => {
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

            Visitor.createVisitor(firstVisitor).then((visitor: IVisitor) => {
                expect(visitor).to.exist;
                return Visitor.createVisitor(secondVisitor);
            }).catch(err => {
                expect(err).to.exist;
                expect(err).to.have.property('code', 11000);

                done();
            });
        });

        it('Should throw error when missing visitor fields', done => {
            let visitor = <IVisitor>{
                _id: '123456'
            };

            Visitor.createVisitor(visitor).catch(err => {
                expect(err).to.exist;
                expect(err).to.have.property('name', 'ValidationError');
                expect(err).to.have.property('message', 'Visitor validation failed');

                done();
            });
        });
    });

    describe('#findVisitor', () => {
        it('Should return null if visitor not exists', done => {
            Visitor.findVisitor('123456').then((visitor: IVisitor) => {
                expect(visitor).to.not.exist;

                done();
            })
        });

        it('Should return visitor', done => {
            let visitor = <IVisitor>{
                _id: '123456',
                name: 'Ron Borysovski',
                company: 'Classified'
            };

            Visitor.createVisitor(visitor).then(() => {
                return Visitor.findVisitor('123456');
            }).then((foundVisitor: IVisitor) => {
                expect(foundVisitor).to.exist;
                expect(foundVisitor).to.have.property('_id', '123456');
                expect(foundVisitor).to.have.property('name', 'Ron Borysovski');

                done();
            });
        });
    });

    describe('#findOrCreateVisitor', () => {
        it('Should create visitor if not exists', done => {
            let visitor = <IVisitor>{
                _id: '123456',
                name: 'Ron Borysovski',
                company: 'Classified'
            };

            Visitor.findOrCreateVisitor(visitor).then((visitor: IVisitor) => {
                expect(visitor).to.exist;
                expect(visitor).to.have.property('_id', '123456');
                expect(visitor).to.have.property('name', 'Ron Borysovski');
                expect(visitor).to.have.property('company', 'Classified');

                done();
            });
        });

        it('Should return visitor if already exists', done => {
            let visitorToCreate = <IVisitor>{
                _id: '123456',
                name: 'Ron Borysovski',
                company: 'Classified'
            };

            Visitor.createVisitor(visitorToCreate).then(() => {
                let visitor = <IVisitor>{
                    _id: '123456'
                };

                return Visitor.findOrCreateVisitor(visitor);
            }).then((visitor: IVisitor) => {
                expect(visitor).to.exist;
                expect(visitor).to.have.property('_id', '123456');
                expect(visitor).to.have.property('name', 'Ron Borysovski');
                expect(visitor).to.have.property('company', 'Classified');

                done();
            });
        });

        it('Should return null when visitor is not provided', done => {
            Visitor.findOrCreateVisitor(null).then((visitor: IVisitor) => {
                expect(visitor).to.not.exist;

                done();
            })
        });
    });

    describe('#searchVisitors', () => {

        beforeEach(done => {
            let visitor1 = <IVisitor>{ _id: '123456', name: 'Ron Borysovski', company: 'Classified' };
            let visitor2 = <IVisitor>{ _id: '1456789', name: 'John Doe', company: 'Unemployeed' };
            let visitor3 = <IVisitor>{ _id: '78910', name: 'Testing Person', company: 'QA' };

            Promise.all([
                Visitor.createVisitor(visitor1),
                Visitor.createVisitor(visitor2),
                Visitor.createVisitor(visitor3)
            ]).then(() => {
                done();
            })
        });

        it('Should return empty collection when visitors not found', done => {
            Visitor.searchVisitors('NotExistingVisitor').then((collection: ICollection<IVisitor>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 0);
                expect(collection).to.have.property('set').that.satisfies((set: IVisitor[]) => {
                    expect(set).to.exist;
                    expect(set).to.be.an('array');
                    expect(set).to.have.length(0);

                    return true;
                });

                done();
            });
        });

        it('Should return visitors searched by name', done => {
            let oneVisitorPromises = ['ron', 'doe', 'person'].map(name => {
                return Visitor.searchVisitors(name);
            });

            let twoVisitorPromises = ['on', 'e', 'i'].map(name => {
                return Visitor.searchVisitors(name);
            });

            let threeVisitorPromises = ['o', 'n'].map(name => {
                return Visitor.searchVisitors(name);
            });

            Promise.all(oneVisitorPromises).then((values: ICollection<IVisitor>[]) => {

                expect(values).to.exist;
                expect(values).to.be.an('array');
                expect(values).to.have.length(3);
                expect(values).to.satisfy((values: ICollection<IVisitor>[]) => {
                    values.forEach((collection: ICollection<IVisitor>) => {
                        expect(collection).to.exist;
                        expect(collection).to.have.property('totalCount', 1);
                    });

                    return true;
                });

                return Promise.all(twoVisitorPromises)
            }).then((values: ICollection<IVisitor>[]) => {

                expect(values).to.exist;
                expect(values).to.be.an('array');
                expect(values).to.have.length(3);
                expect(values).to.satisfy((values: ICollection<IVisitor>[]) => {
                    values.forEach((collection: ICollection<IVisitor>) => {
                        expect(collection).to.exist;
                        expect(collection).to.have.property('totalCount', 2);
                    });

                    return true;
                });

                return Promise.all(threeVisitorPromises)
            }).then((values: ICollection<IVisitor>[]) => {

                expect(values).to.exist;
                expect(values).to.be.an('array');
                expect(values).to.have.length(2);
                expect(values).to.satisfy((values: ICollection<IVisitor>[]) => {
                    values.forEach((collection: ICollection<IVisitor>) => {
                        expect(collection).to.exist;
                        expect(collection).to.have.property('totalCount', 3);
                    });

                    return true;
                });

                done();
            });
        });

        it('Should return visitors searched by id', done => {
            let oneVisitorPromises = ['123', '567', '7891'].map(id => {
                return Visitor.searchVisitors(id);
            });

            let twoVisitorPromises = ['456', '789'].map(id => {
                return Visitor.searchVisitors(id);
            });

            let threeVisitorPromises = ['1'].map(id => {
                return Visitor.searchVisitors(id);
            });

            Promise.all(oneVisitorPromises).then((values: ICollection<IVisitor>[]) => {

                expect(values).to.exist;
                expect(values).to.be.an('array');
                expect(values).to.have.length(3);
                expect(values).to.satisfy((values: ICollection<IVisitor>[]) => {
                    values.forEach((collection: ICollection<IVisitor>) => {
                        expect(collection).to.exist;
                        expect(collection).to.have.property('totalCount', 1);
                    });

                    return true;
                });

                return Promise.all(twoVisitorPromises)
            }).then((values: ICollection<IVisitor>[]) => {

                expect(values).to.exist;
                expect(values).to.be.an('array');
                expect(values).to.have.length(2);
                expect(values).to.satisfy((values: ICollection<IVisitor>[]) => {
                    values.forEach((collection: ICollection<IVisitor>) => {
                        expect(collection).to.exist;
                        expect(collection).to.have.property('totalCount', 2);
                    });

                    return true;
                });
                return Promise.all(threeVisitorPromises)
            }).then((values: ICollection<IVisitor>[]) => {

                expect(values).to.exist;
                expect(values).to.be.an('array');
                expect(values).to.have.length(1);
                expect(values).to.satisfy((values: ICollection<IVisitor>[]) => {
                    values.forEach((collection: ICollection<IVisitor>) => {
                        expect(collection).to.exist;
                        expect(collection).to.have.property('totalCount', 3);
                    });

                    return true;
                });

                done();
            });
        });

        it('Should return all visitors when no search term provided', done => {
            Visitor.searchVisitors('').then((collection: ICollection<IVisitor>) => {
                expect(collection).to.exist;
                expect(collection).to.have.property('totalCount', 3);
                expect(collection).to.have.property('set').that.satisfies((set: IVisitor[]) => {
                    expect(set).to.exist;
                    expect(set).to.be.an('array');
                    expect(set).to.have.length(3);

                    return true;
                });

                done();
            })
        });
    });
});