/// <reference path="../../typings/index.d.ts" />
import { BaseManager } from './../server/managers/base.manager';
import { Base } from './../server/classes/base';
import { expect } from 'chai';

describe('BaseManager', () => {

    let baseManager: BaseManager = new BaseManager();

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
                expect(base).to.have.property('name', 'base');

                done();
            });
        });
        it('Should throw an error when base with same name exists', done => {
            baseManager.create(new Base('base')).then(base => {
                expect(base).to.exist;
                baseManager.create(new Base('base')).catch(error => {
                    expect(error).to.exist;
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

        it('Should return all bases from db');
    });

    describe('#read', () => {
        it('Should return nothing when id not found');
        it('Should return base by id');
    });

    describe('#update', () => {
        it('Should do nothing when base not exists');
        it('Should throw an error when duplicated name found');
        it('Should update base');
    });

    describe('#delete', () => {
        it('Should do nothing when base not found');
        it('Should delete the base');
    });

    describe('#search', () => {
        it('Should return all bases when no searchTerm provided');
        it('Should return nothing when searchTerm don\'t match any name');
        it('Should return bases filtered by searchTerm');
    })
});