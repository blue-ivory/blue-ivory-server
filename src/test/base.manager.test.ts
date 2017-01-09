/// <reference path="../../typings/index.d.ts" />
import { BaseManager } from './../server/managers/base.manager';
import { UserManager } from './../server/managers/user.manager';
import { Base } from './../server/classes/base';
import { User } from './../server/classes/user';
import { expect } from 'chai';

describe('BaseManager', () => {

    let baseManager: BaseManager = new BaseManager();
    let userManager: UserManager = new UserManager();

    describe('#create', () => {
        it('Should throw an error when invalid data', done => {
            baseManager.create(new Base('')).catch(error => {
                expect(error).to.exist;
                expect(error).to.have.property('errors');
                expect(error.errors).to.have.property('name');
                expect(error.errors.name).to.have.property('kind', 'required');

                done();
            })
        });
        it('Should create base', done => {
            baseManager.create(new Base('base')).then(base => {
                expect(base).to.exist;
                expect(base).to.have.property('_id');
                expect(base).to.have.property('name', 'base');

                done();
            });
        });
        it('Should throw an error when base with same name exists', done => {
            baseManager.create(new Base('base')).then(base => {
                expect(base).to.exist;
                baseManager.create(new Base('base')).catch(error => {
                    expect(error).to.exist;
                    expect(error).to.have.property('code', 11000);

                    done();
                });
            });
        });
    });

    describe('#all', () => {
        it('Should return nothing when db is empty', done => {
            baseManager.all().then(bases => {
                expect(bases).to.exist;
                expect(bases).to.be.an('array');
                expect(bases).to.have.length(0);

                done();
            });
        });

        it('Should return all bases from db', done => {
            baseManager.create(new Base('base')).then(() => {
                baseManager.create(new Base('base2')).then(() => {
                    baseManager.create(new Base('base3')).then(() => {
                        baseManager.all().then(bases => {
                            expect(bases).to.exist;
                            expect(bases).to.be.an('array');
                            expect(bases).to.have.length(3);

                            done();
                        });
                    });
                });
            });
        });
    });

    describe('#read', () => {
        it('Should return nothing when id not found', done => {
            // HEX value with length of 24 represents mongoose.Schema.Types.ObjectId
            baseManager.read('000000000000000000000000').then(base => {
                expect(base).to.not.exist;
                done();
            });
        });
        it('Should return base by id', done => {
            baseManager.create(new Base('bName')).then(base => {
                expect(base).to.exist;

                baseManager.read(base._id).then(foundBase => {
                    expect(foundBase).to.exist;
                    expect(foundBase).to.have.property('name', 'bName');

                    done();
                });
            });
        });
    });

    describe('#update', () => {
        it('Should do nothing when base not exists', done => {
            let base: Base = new Base('name');
            base._id = '000000000000000000000000';
            baseManager.update(base).then(base => {
                expect(base).to.not.exist;
                done();
            });
        });
        it('Should throw an error when duplicated name found', done => {
            baseManager.create(new Base('bName')).then(() => {
                baseManager.create(new Base('bName2')).then(base => {
                    expect(base).to.exist;
                    base.name = 'bName';
                    baseManager.update(base).catch(error => {
                        expect(error).to.exist;
                        expect(error).to.have.property('code', 11000);

                        done();
                    });
                });
            });
        });
        it('Should update base', done => {
            baseManager.create(new Base('name')).then(base => {
                expect(base).to.exist;
                base.name = 'bName';
                baseManager.update(base).then(updatedBase => {
                    expect(updatedBase).to.exist;
                    expect(updatedBase).to.have.property('name', 'bName');

                    done();
                });
            });
        });
    });

    describe('#delete', () => {
        it('Should do nothing when base not found', done => {
            baseManager.delete('000000000000000000000000').then(base => {
                expect(base).to.not.exist;

                done();
            });
        });
        it('Should delete the base', done => {
            baseManager.create(new Base('name')).then(base => {
                expect(base).to.exist;

                baseManager.delete(base._id).then(deletedBase => {
                    expect(deletedBase).to.exist;

                    baseManager.read(base._id).then(base => {
                        expect(base).to.not.exist;

                        done();
                    });
                });
            });
        });
    });

    describe('#search', () => {
        it('Should return all bases when no searchTerm provided', done => {
            baseManager.create(new Base('name1')).then(() => {
                baseManager.create(new Base('name2')).then(() => {
                    baseManager.create(new Base('name3')).then(() => {
                        baseManager.search('').then(bases => {
                            console.log(bases);
                            expect(bases).to.exist;
                            expect(bases).to.be.an('array');
                            expect(bases).to.have.length(3);

                            done();
                        });
                    });
                });
            });
        });
        it('Should return nothing when searchTerm don\'t match any name', done => {
            baseManager.create(new Base('name1')).then(() => {
                baseManager.create(new Base('name2')).then(() => {
                    baseManager.create(new Base('name3')).then(() => {
                        baseManager.search('test').then(bases => {
                            expect(bases).to.exist;
                            expect(bases).to.be.an('array');
                            expect(bases).to.have.length(0);

                            done();
                        });
                    });
                });
            });
        });
        it('Should return bases filtered by searchTerm', done => {
            baseManager.create(new Base('test')).then(() => {
                baseManager.create(new Base('rtst')).then(() => {
                    baseManager.create(new Base('ees21s')).then(() => {
                        baseManager.search('st').then(bases => {
                            expect(bases).to.exist;
                            expect(bases).to.be.an('array');
                            expect(bases).to.have.length(2);

                            baseManager.search('21').then(bases => {
                                expect(bases).to.exist;
                                expect(bases).to.be.an('array');
                                expect(bases).to.have.length(1);

                                baseManager.search('es').then(bases => {
                                    expect(bases).to.exist;
                                    expect(bases).to.be.an('array');
                                    expect(bases).to.have.length(2);

                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });

        it('Should return base with amount of users', done => {
            baseManager.create(new Base('Dolphin')).then((base1: Base) => {
                baseManager.create(new Base('Misha')).then((base2: Base) => {
                    userManager.create(new User('12', '22', 'id1', '42')).then(() => {
                        userManager.create(new User('1', '2', 'id2', '4')).then(() => {
                            userManager.setBase('id1', base1).then(() => {
                                userManager.setBase('id2', base1).then(() => {
                                    baseManager.search('dol').then(bases => {
                                        expect(bases).to.exist;
                                        expect(bases).to.be.an('array');
                                        expect(bases).to.have.length(1);
                                        expect(bases[0]).to.have.property('name', 'Dolphin');
                                        expect(bases[0]).to.have.property('users');
                                        expect(bases[0].users).to.eql(2);

                                        done();
                                    })
                                });
                            });
                        });
                    });
                });
            });
        });
    })
});